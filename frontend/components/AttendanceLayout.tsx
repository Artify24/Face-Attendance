"use client";
import React, { useState } from "react";
import WebCam from "./WebCam";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Student } from "@/types/students";
import Image from "next/image";
import { CiClock2 } from "react-icons/ci"
import { TiDeleteOutline } from "react-icons/ti";

const AttendanceLayout = () => {
  const [presentStudents, setpresentStudents] = useState<Student[]>([])
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Live Attendance
        </h1>
        <p className="text-xl sm:text-base text-slate-600">
          Smart Attendance System - {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <WebCam />

        <Card className="w-full">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex item-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">
                  Present Students ({presentStudents.length})
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  Students marked present today
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {presentStudents.length} Present
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {presentStudents.length === 0 ? (
                <div className="text-center py-8">
                  <CiClock2 />

                  <p className="text-slate-500 text-sm">No students marked present yet</p>
                </div>
              ) : (
                presentStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={student.avatar || "/placeholder.svg"}
                        alt={student.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium text-slate-900 text-sm">{student.name}</div>
                        <div className="text-xs text-slate-600">
                          {student.rollNumber} • {student.branch}
                        </div>
                        <div className="text-xs text-green-600">Marked at {student.markedAt}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TiDeleteOutline className="h-4 w-4" />
                    </Button>
                  </div>
                   ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceLayout;
