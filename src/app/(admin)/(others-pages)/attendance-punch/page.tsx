
"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/authentication";
// Removed API integration

export default function AttendancePunch() {
  const [gpsEnabled, setGpsEnabled] = useState<boolean | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState<boolean | null>(null);
  const [location, setLocation] = useState<{latitude: number, longitude: number, accuracy: number, timestamp: number} | null>(null);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentUser = useSelector(selectUser);
  
  // Removed API hooks

  // Check permissions on component mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Removed API error handling

  const checkPermissions = async () => {
    try {
      // Check GPS permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => setGpsEnabled(true),
          () => setGpsEnabled(false)
        );
      } else {
        setGpsEnabled(false);
      }

      // Check camera permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraEnabled(true);
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      } catch (err) {
        setCameraEnabled(false);
      }
    } catch (err) {
      console.error("Error checking permissions:", err);
    }
  };

  const requestLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          resolve(locationData);
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        return new Promise<void>((resolve, reject) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              resolve();
            };
            videoRef.current.onerror = () => {
              reject(new Error("Video failed to load"));
            };
          } else {
            reject(new Error("Video element not available"));
          }
        });
      }
    } catch (err) {
      console.error("Error starting camera:", err);
      setError("Failed to start camera. Please check permissions.");
      throw err;
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error("Video element not available"));
        return;
      }

      if (!canvasRef.current) {
        reject(new Error("Canvas element not available"));
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Check if video is ready
      if (video.readyState < 2) { // HAVE_CURRENT_DATA
        reject(new Error("Video is not ready yet. Please wait a moment and try again."));
        return;
      }

      // Check if video has valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        reject(new Error("Video dimensions are not available"));
        return;
      }

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      resolve(photoData);
    });
  };

  const handlePunchIn = async () => {
    setError("");
    setSuccess("");

    try {
      // Get location
      const locationData = await requestLocation() as any;
      setLocation(locationData);

      // Start camera
      await startCamera();

      // Wait a moment for video to be fully ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capture photo with retry mechanism
      let photo: string = "";
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          photo = await capturePhoto();
          break;
        } catch (err) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw err;
          }
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      setCapturedPhoto(photo);

      console.log("Punch In Data:", {
        location: locationData,
        photo: photo ? "Captured" : "Failed",
        timestamp: new Date().toISOString()
      });

      setIsPunchedIn(true);
      setSuccess("Punched in successfully! (Demo mode - no data sent to server)");
      
    } catch (err: any) {
      console.error("Punch in error:", err);
      const errorMessage = err?.message || "Failed to punch in";
      setError(errorMessage);
    }
  };

  const handlePunchOut = async () => {
    setError("");
    setSuccess("");

    try {
      // Get location
      const locationData = await requestLocation() as any;
      setLocation(locationData);

      // Capture photo
      const photo = await capturePhoto();
      setCapturedPhoto(photo);

      console.log("Punch Out Data:", {
        location: locationData,
        photo: photo ? "Captured" : "Failed",
        timestamp: new Date().toISOString()
      });

      setIsPunchedIn(false);
      setSuccess("Punched out successfully! (Demo mode - no data sent to server)");
      
      // Stop camera
      stopCamera();
      
    } catch (err: any) {
      console.error("Punch out error:", err);
      const errorMessage = err?.message || "Failed to punch out";
      setError(errorMessage);
    }
  };

  const handlePermissionRetry = () => {
    setGpsEnabled(null);
    setCameraEnabled(null);
    checkPermissions();
  };

  // Removed coordinates loading screen

  // Show permission request screen
  if (gpsEnabled === null || cameraEnabled === null) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Attendance Punch" />
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Checking Permissions...
            </h2>
            <p className="text-gray-600">
              Please wait while we check your GPS and camera permissions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show permission denied screen
  if (gpsEnabled === false || cameraEnabled === false) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Attendance Punch" />
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-lg rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Permissions Required
              </h2>
              <p className="text-gray-600 mb-6">
                To use attendance punch, please enable the following permissions:
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${gpsEnabled ? 'bg-green-100' : 'bg-red-100'}`}>
                  {gpsEnabled ? (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`font-medium ${gpsEnabled ? 'text-green-800' : 'text-red-800'}`}>
                  GPS Location Access
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${cameraEnabled ? 'bg-green-100' : 'bg-red-100'}`}>
                  {cameraEnabled ? (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`font-medium ${cameraEnabled ? 'text-green-800' : 'text-red-800'}`}>
                  Camera Access
                </span>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={handlePermissionRetry}
                variant="primary"
                size="md"
                className="w-full"
              >
                Check Permissions Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show permission granted screen with punch button
  if (gpsEnabled === true && cameraEnabled === true) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Attendance Punch" />
        
        <div className="max-w-4xl mx-auto">
          {/* Permission Status */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-green-800 mb-1">
                  Permissions Granted!
                </h2>
                <p className="text-green-700">
                  GPS and Camera access enabled. You can now punch in/out.
                </p>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow-lg rounded-xl p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Ready'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className={`text-lg font-semibold ${isPunchedIn ? 'text-green-600' : 'text-gray-600'}`}>
                    {isPunchedIn ? 'Punched In' : 'Not Punched In'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Camera</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {cameraStream ? 'Active' : 'Ready'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Punch Interface */}
          <div className="bg-white shadow-lg rounded-2xl p-8">
            {/* Error and Success Messages */}
            {error && (
              <Alert
                variant="error"
                title="Error"
                message={error}
              />
            )}
            {success && (
              <Alert
                variant="success"
                title="Success"
                message={success}
              />
            )}

            {/* Camera Preview */}
            {cameraStream && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Preview</h3>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-100 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Captured Photo */}
            {capturedPhoto && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Captured Photo</h3>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={capturedPhoto}
                    alt="Captured photo"
                    className="w-full h-100 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Punch Button */}
            <div className="text-center">
              <Button
                onClick={isPunchedIn ? handlePunchOut : handlePunchIn}
                variant={isPunchedIn ? "outline" : "primary"}
                size="md"
                disabled={false}
                className="px-12 py-4 text-lg font-semibold"
              >
                {isPunchedIn ? "Punch Out" : "Punch In"}
              </Button>
            </div>

            {/* Instructions */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                {isPunchedIn 
                  ? "Click 'Punch Out' to end your work session. Your location and photo will be recorded."
                  : "Click 'Punch In' to start your work session. Your location and photo will be recorded."
                }
              </p>
            </div>
          </div>

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Attendance Punch" />
      
      <div className="max-w-4xl mx-auto">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Location</p>
                <p className="text-lg font-semibold text-gray-900">
                  {location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Not available'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className={`text-lg font-semibold ${isPunchedIn ? 'text-green-600' : 'text-gray-600'}`}>
                  {isPunchedIn ? 'Punched In' : 'Not Punched In'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Camera</p>
                <p className="text-lg font-semibold text-gray-900">
                  {cameraStream ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Punch Interface */}
        <div className="bg-white shadow-lg rounded-2xl p-8">
          {/* Error and Success Messages */}
          {error && (
            <Alert
              variant="error"
              title="Error"
              message={error}
            />
          )}
          {success && (
            <Alert
              variant="success"
              title="Success"
              message={success}
            />
          )}

          {/* Camera Preview */}
          {cameraStream && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Camera Preview</h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-100 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {/* Captured Photo */}
          {capturedPhoto && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Captured Photo</h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={capturedPhoto}
                  alt="Captured photo"
                  className="w-full h-100 object-cover"
                />
              </div>
            </div>
          )}

          {/* Punch Button */}
          <div className="text-center">
            <Button
              onClick={isPunchedIn ? handlePunchOut : handlePunchIn}
              variant={isPunchedIn ? "outline" : "primary"}
              size="md"
              disabled={false}
              className="px-12 py-4 text-lg font-semibold"
            >
              {isPunchedIn ? "Punch Out" : "Punch In"}
            </Button>
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isPunchedIn 
                ? "Click 'Punch Out' to end your work session. Your location and photo will be recorded."
                : "Click 'Punch In' to start your work session. Your location and photo will be recorded."
              }
            </p>
          </div>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}