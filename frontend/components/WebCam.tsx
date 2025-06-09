"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Webcam from "react-webcam";
import { Button } from "./ui/button";

const videoConstraints = {
  width: 720,
  height: 720,
  facingMode: "user",
};

const WebCam = () => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isWebcamStarted, setIsWebcamStarted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isCapturing, setIsCapturing] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState<{
    success: boolean;
    student?: any;
    message: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startWebcam = () => {
    setIsWebcamStarted(true);
    setCapturedImage(null);
    setCountdown(5);
    setIsCapturing(false);
    setAttendanceResult(null);
  };

  const stopWebcam = () => {
    setIsWebcamStarted(false);
    setCountdown(5);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isWebcamStarted && !capturedImage && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && !capturedImage && !isCapturing) {
      setIsCapturing(true);
      captureImage();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWebcamStarted, countdown, capturedImage, isCapturing]);

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setIsCapturing(false);
        verifyAttendance(imageSrc);
      }
    }
  };

  const verifyAttendance = async (imageSrc: string) => {
    setIsProcessing(true);
    try {
      const blob = await fetch(imageSrc).then((res) => res.blob());
      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");

      const response = await fetch(
        "http://localhost:8000/verify-attendance-image",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Verification failed");
      const result = await response.json();
      setAttendanceResult(result);
    } catch (error) {
      setAttendanceResult({
        success: false,
        message: "Error processing attendance",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setCountdown(5);
    setAttendanceResult(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">
          Face Attendance System
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Position your face in the frame for recognition
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 sm:px-6">
        <div className="space-y-4">
          <div className="relative bg-slate-100 overflow-hidden aspect-square rounded-lg">
            {!isWebcamStarted && !capturedImage && (
              <div className="flex flex-col items-center justify-center h-full">
                <Button onClick={startWebcam} className="mb-4">
                  Start Camera
                </Button>
                <p className="text-slate-500 text-sm">
                  Camera will automatically capture your face
                </p>
              </div>
            )}

            {isWebcamStarted && !capturedImage && (
              <div className="relative h-full">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-green-400 rounded-full w-64 h-64"></div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <div className="bg-black bg-opacity-50 text-white py-2 px-4 rounded-full inline-block">
                    {countdown > 0
                      ? `Capturing in ${countdown}...`
                      : "Capturing now..."}
                  </div>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="text-lg font-medium mb-4">
                  {isProcessing ? "Processing..." : "Captured Image"}
                </div>

                <img
                  src={capturedImage}
                  alt="Captured face"
                  className="rounded-lg border border-slate-200 max-h-64"
                />

                {attendanceResult && (
                  <div
                    className={`mt-4 p-4 rounded-lg ${
                      attendanceResult.success
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <p className="font-medium">{attendanceResult.message}</p>
                    {attendanceResult.student && (
                      <div className="mt-2 text-sm">
                        <p>Name: {attendanceResult.student.name}</p>
                        <p>Roll: {attendanceResult.student.rollNumber}</p>
                        <p>Branch: {attendanceResult.student.branch}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={retakePhoto}
                    disabled={isProcessing}
                  >
                    Retake
                  </Button>
                  {!isProcessing && !attendanceResult?.success && (
                    <Button onClick={() => verifyAttendance(capturedImage)}>
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {isWebcamStarted && (
            <div className="text-center text-sm text-slate-500">
              Please position your face within the circle and keep still
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebCam;
