# Deploy-mode wrapper for /maixapp/apps/<id>/run.py.
#
# DOES NOT call kill_system_app() — when launched as a Maix App, the
# launcher itself IS the parent process; killing /maixapp/apps/* would
# kill the launcher (and us) before user code runs.
#
# Auto exit-overlay: monkey-patches display.Display.show so every
# frame the user draws gets a small red "X" in the top-left corner
# *before* it's pushed to the LCD. The same hook drains the
# touchscreen event queue and exits when the user taps inside the
# overlay zone — no thread, no second process opening the touchscreen.
import signal
import sys


def handler_stop_signals(signum, _frame):
    print(f"Received signal {signum}, exiting gracefully...")
    sys.exit(0)


signal.signal(signal.SIGINT, handler_stop_signals)
signal.signal(signal.SIGTERM, handler_stop_signals)


_EXIT_BTN_SIZE = 56   # px — diameter of the round button
_EXIT_BTN_PAD  = 8    # px — gap from screen edge


def _install_exit_overlay():
    try:
        from maix import display, image, touchscreen, app  # noqa: F401
    except Exception as e:
        print(f"[exit_overlay] maix import failed: {e}")
        return

    try:
        _ts = touchscreen.TouchScreen()
    except Exception as e:
        print(f"[exit_overlay] TouchScreen() failed: {e}")
        return

    _orig_show = display.Display.show
    # Computed lazily on the first show() once we know the display
    # size — same patch must work on 320x240, 640x480, etc.
    _zone = {"ready": False, "cx": 0, "cy": 0, "r": 0,
             "hit_x": 0, "hit_y": 0, "hit_w": 0, "hit_h": 0}

    def _ensure_zone(self):
        if _zone["ready"]:
            return
        try:
            w = self.width()
        except Exception:
            w = 320
        r = _EXIT_BTN_SIZE // 2
        cx = w - _EXIT_BTN_PAD - r
        cy = _EXIT_BTN_PAD + r
        _zone.update(ready=True, cx=cx, cy=cy, r=r,
                     hit_x=cx - r, hit_y=cy - r,
                     hit_w=2 * r, hit_h=2 * r)

    def _patched_show(self, img, *args, **kwargs):
        _ensure_zone(self)
        # 1) Draw the exit button on the same frame the user is about
        #    to display. Wrap in try/except so an oddly-typed img
        #    (e.g. a numpy array) can't crash the user's app.
        try:
            red   = image.Color.from_rgb(220, 30, 30)
            dark  = image.Color.from_rgb(120,  0,  0)
            white = image.Color.from_rgb(255, 255, 255)
            cx, cy, r = _zone["cx"], _zone["cy"], _zone["r"]
            # filled red disc (thickness=-1 in maix.image == fill), a
            # darker outer ring for contrast against light scenes, then
            # a thick white X stroke.
            img.draw_circle(cx, cy, r,     color=red,   thickness=-1)
            img.draw_circle(cx, cy, r + 1, color=dark,  thickness=2)
            d = int(r * 0.45)
            img.draw_line(cx - d, cy - d, cx + d, cy + d, color=white, thickness=4)
            img.draw_line(cx - d, cy + d, cx + d, cy - d, color=white, thickness=4)
        except Exception:
            pass

        # 2) Drain pending touch events — Sipeed's pattern is to read
        #    until ts.available() goes false; otherwise read() returns
        #    the OLDEST unread event and we lag behind the user.
        try:
            x = y = pressed = 0
            had = False
            while _ts.available():
                x, y, pressed = _ts.read()
                had = True
            hx, hy, hw, hh = _zone["hit_x"], _zone["hit_y"], _zone["hit_w"], _zone["hit_h"]
            if had and pressed and hx <= x < hx + hw and hy <= y < hy + hh:
                print("[exit_overlay] tap in zone — exiting")
                try:
                    app.set_exit_flag(True)
                except Exception:
                    pass
                sys.exit(0)
        except Exception:
            pass

        return _orig_show(self, img, *args, **kwargs)

    display.Display.show = _patched_show


_install_exit_overlay()

##{main}##
