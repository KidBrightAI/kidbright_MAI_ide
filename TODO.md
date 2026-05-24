# TODO — Future improvements

Items here are deferred enhancements that aren't blocking. Each entry should explain the motivation, the proposed approach, and any prerequisites or risks so a future maintainer can pick it up cold.

---

## Drop-in service convention for V2 board

**Why:** Today, adding a new always-on service (e.g. an `xxx.py` daemon) on the MaixCAM (V2) board requires editing `boards/kidbright-mai-plus/scripts/S99ws_shell` to insert one more `python3 -u /root/scripts/xxx.py &` line. That's manageable for two services (current state: ws_shell + maix_stream) but doesn't scale — every new service touches the boot-critical init script.

**Idea:** Move the per-service start lines out of `S99ws_shell` into a directory convention. The init script scans `/root/scripts/*.service.py` (or similar) at boot and runs each as a background process. Adding a new service then becomes:

1. Drop `xxx.service.py` into `boards/kidbright-mai-plus/scripts/`.
2. Add a `managedScripts` entry for it in `boards/kidbright-mai-plus/index.js`.
3. Done — no edit to `S99ws_shell` needed.

The script-sync registry handles version + hash propagation per the existing design.

**Sketch of the new `S99ws_shell`:**

```sh
#!/bin/sh
case "$1" in
  start)
    /usr/bin/python3 -u /root/ws_shell.py > /root/ws_shell.log 2>&1 &
    sleep 5
    /usr/bin/python3 -u /root/maix_stream.py > /root/maix_stream.log 2>&1 &
    for f in /root/scripts/*.service.py; do
      [ -f "$f" ] || continue
      name=$(basename "$f" .service.py)
      /usr/bin/python3 -u "$f" > "/root/${name}.log" 2>&1 &
    done
    ;;
  stop)
    killall python3 2>/dev/null
    ;;
esac
```

**Prerequisite:** `S99ws_shell` is now IDE-managed (see `managedScripts` in V2 metadata + the Vite glob in `main.js` that picks up `S[0-9][0-9]*` files). One-time bump of `S99ws_shell` version pushes the new logic out via script-sync; existing services keep working since they're spelled out explicitly above the loop.

**Risks:**
- The init script is the boot path. A logic bug ships only after the user reboots, so the bug window is short, but a typo in the new scan loop could prevent any service from starting. Atomic `.tmp` + `mv` covers partial-write corruption, not logic errors. Keep the change minimal and dry-run on a spare board first.
- No per-service config (env vars, args). Either accept this constraint or extend the convention with a sidecar metadata file (`xxx.service.json`) — out of scope for the initial drop-in.
- No watchdog. If a service crashes, the board doesn't relaunch it. Same behavior as today's hard-coded services, so not a regression.

**Decision deferred:** the current Path B (S99ws_shell IDE-managed, hand-edited per new service) handles the foreseeable workload. Revisit when there's a third service to add.

---

## Remove the YOLO11 N==4 sigmoid-pad workaround

**Why:** MaixCAM's on-board `nn.YOLO11.detect()` C++ wrapper raises `Invalid arguments: Tensors get tensor idx error` (`-404232217`) on the *second* forward call when the trained model has exactly `num_classes == 4`. The wrapper appears to disambiguate DFL vs Sigmoid output tensors via a shape heuristic that collides when Sigmoid's class channel C equals DFL's bbox dimension (always 4).

**Verified scope:**
- Reproduces on two unrelated datasets converted from scratch with N=4 (`Test-OBJ`, `object_detect_kbplus` split into A/B variants).
- Does *not* reproduce at N = 2, 3, 5, 80 — tested across bundled COCO yolo11s, dogphone, V1.zip, and an N=5 synthesis of Test-OBJ.
- Independent of label names, training params, model variant (yolo11n/yolo11s), tpu-mlir version (v1.27 vs v1.28.1), or quantize flag (INT8/BF16).

**Workaround currently in place:**
- `kidbright_MAI_server/main.py` → `_yolo11_pad_sigmoid_output()` injects an all-zero channel via ONNX `Concat` after `/model.23/Sigmoid_output_0`, turning the head's class output from `[1, 4, 1470]` into `[1, 5, 1470]`. Auto-applied only when `num_classes == 4`; other N pass through unchanged. The resulting `.mud` appends a trailing `__pad__` label so the on-board wrapper's label count matches the new sigmoid C.
- `boards/kidbright-mai-plus/libs/detector_runtime.py` → `Detector.detect()` skips any output whose `class_id >= len(self.labels)`. Defensive for every N, hides the placeholder for N=4.

**Remove when:** MaixCAM team patches the wrapper. Set `KBMAI_YOLO11_PAD_OFF=1` in the server env to disable the pad locally and re-verify whether the upstream fix actually resolves it. To fully remove: drop `_yolo11_pad_sigmoid_output` plus the `yolo11_pad_sigmoid` branch and `mud_labels.append("__pad__")` from `main.py`, plus the `cid >= len(self.labels)` skip in `detector_runtime.py`.

**Cost of keeping:** negligible — N=4 cvimodel grows by a few KB (one extra zero channel through the head), one extra label string in `.mud`, and one comparison per detection. Other N values bypass the whole path.

**Tracked at:** [#1 — YOLO11 detect() crashes on 2nd call when num_classes == 4](https://github.com/KidBrightAI/kidbright_MAI_ide/issues/1)
