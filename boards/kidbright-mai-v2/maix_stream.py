from maix import camera
# import display, app - Removed to prevent cleanup conflicts
import socket
import time
import gc
import sys
import signal

def signal_handler(sig, frame):
    print("\nCtrl+C pressed. Exiting gracefully...")
    sys.exit(0)

# Register signal handler
signal.signal(signal.SIGINT, signal_handler)

def stream_mjpeg(host='0.0.0.0', port=8000):
    print("Starting MJPEG Stream Script...")
    
    # Global Camera Init (Stability Fix)
    cam = None
    try:
        print("Initializing camera (640x480)...")
        cam = camera.Camera(640, 480)
        
        cam.vflip(1)
        cam.hmirror(1)
        
        cam.skip_frames(30)
        print("Camera initialized successfully.")
        
    except Exception as e:
        print(f"FAILED to initialize camera: {e}")
        return

    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    try:
        server_socket.bind((host, port))
        server_socket.listen(1)
        print(f"MJPEG Stream running at http://{host}:{port}")
        
        while True:
            print("\nWaiting for connection...")
            try:
                client_socket, addr = server_socket.accept()
                print(f"Connection from {addr}")
            except KeyboardInterrupt:
                print("Stopping server (KeyboardInterrupt)...")
                break
            except Exception as e:
                print(f"Accept error: {e}")
                continue
            
            # Connection Handler
            try:
                # Send HTTP header
                client_socket.sendall(b"HTTP/1.0 200 OK\r\n"
                                      b"Server: MaixPy3-MJPEG\r\n"
                                      b"Connection: close\r\n"
                                      b"Content-Type: multipart/x-mixed-replace;boundary=boundarydonotcross\r\n\r\n")
                
                print("Client connected. Streaming...")
                error_count = 0
                frame_count = 0
                
                while True:
                    try:
                        img = cam.read()
                        if img is None:
                            error_count += 1
                            if error_count % 10 == 0:
                                print(f"Frame None count: {error_count}")
                            time.sleep(0.01)
                            continue
                        
                        error_count = 0
                        
                        # Compress
                        jpeg = img.to_jpeg(quality=70)
                        jpeg_bytes = jpeg.to_bytes()
                        
                        # Header
                        header = (b"--boundarydonotcross\r\n"
                                  b"Content-Type: image/jpeg\r\n"
                                  b"Content-Length: " + str(len(jpeg_bytes)).encode() + b"\r\n\r\n")
                                  
                        client_socket.sendall(header)
                        client_socket.sendall(jpeg_bytes)
                        client_socket.sendall(b"\r\n")
                        
                        frame_count += 1
                        if frame_count % 60 == 0:
                             print(f"Sent {frame_count} frames")

                        # Cleanup memory
                        del jpeg
                        del jpeg_bytes
                        del img
                        
                    except OSError:
                        print("Client disconnected.")
                        break
                    except Exception as e:
                        print(f"Stream error: {e}")
                        break
                        
            except Exception as e:
                print(f"Handler error: {e}")
            finally:
                if client_socket:
                    client_socket.close()

    except KeyboardInterrupt:
        print("Server stopping...")
    except Exception as e:
        print(f"Server error: {e}")
    finally:
        server_socket.close()
        print("Server closed.")
        
        # Proper camera cleanup
        if cam:
            print("Cleaning up camera resources...")
            try:
                # User reported cam.close() exists in docs
                if hasattr(cam, 'close'):
                    cam.close()
                    print("Camera closed.")
                else:
                    del cam
                    gc.collect()
                    print("Camera deleted.")
            except Exception as e:
                print(f"Error releasing camera: {e}")

if __name__ == "__main__":
    stream_mjpeg()
