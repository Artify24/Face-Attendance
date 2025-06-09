"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import Image from "next/image";
import { Button } from "./ui/button";
import { RxCross2 } from "react-icons/rx";
import { Upload } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import axios from "axios";
import { toast } from "sonner";

const AddStudent = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNumber: "",
    branch: "",
    year: "",
    phone: "",
    address: "",
    image: null as File | null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setPreviewUrl(null);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("rollNumber", formData.rollNumber);
    data.append("branch", formData.branch);
    data.append("year", formData.year);
    data.append("phone", formData.phone);
    data.append("address", formData.address);

    if (formData.image) {
      data.append("image", formData.image);
    }
   

    const response = await axios.post(
      "http://localhost:3000/api/students",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Response:", response);
    if (response.status === 201) {
      toast.success("Student Added successful!");
      setFormData({
        name: "",
        email: "",
        rollNumber: "",
        branch: "",
        year: "",
        phone: "",
        address: "",
        image: null,
      });
      setPreviewUrl(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h1 className="text-xl sm:text-2xl font-bold">Add New Student</h1>
        <p className="text-sm sm:text-base text-slate-600">
          Fill in the student details to add them to the system
        </p>
      </div>

      <Card className="w-[50%]  mx-auto">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">
            Student Information
          </CardTitle>

          <CardDescription className="text-sm text-slate-600">
            Enter the complete details of the engineering student
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <div className="space-y-4 mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
              <Label className="text-sm font-medium text-slate-700">
                Profile Picture
              </Label>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="relative">
                  {previewUrl ? (
                    <div className="relative">
                      <Image
                        src={previewUrl || "/placeholder.svg"}
                        alt="Profile preview"
                        width={100}
                        height={100}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-slate-300"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={removeImage}
                      >
                        <RxCross2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="border-slate-300 focus:border-primary focus:ring-primary"
                  />
                  <p className="text-xs text-slate-500">
                    Upload a profile picture (JPG, PNG, GIF up to 5MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                  required
                  className="border-slate-300 focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="rollNumber"
                  className="text-sm font-medium text-slate-700"
                >
                  Roll Number *
                </Label>
                <Input
                  id="rollNumber"
                  value={formData.rollNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, rollNumber: e.target.value })
                  }
                  placeholder="ENG001"
                  required
                  className="border-slate-300 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="student@engineering.edu"
                  required
                  className="border-slate-300 focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-slate-700"
                >
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                  className="border-slate-300 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="branch"
                  className="text-sm font-medium text-slate-700"
                >
                  Branch *
                </Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) =>
                    setFormData({ ...formData, branch: value })
                  }
                >
                  <SelectTrigger className="border-slate-300 focus:border-primary focus:ring-primary">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">
                      Computer Science
                    </SelectItem>
                    <SelectItem value="Mechanical">
                      Mechanical Engineering
                    </SelectItem>
                    <SelectItem value="Electrical">
                      Electrical Engineering
                    </SelectItem>
                    <SelectItem value="Civil">Civil Engineering</SelectItem>
                    <SelectItem value="Electronics">
                      Electronics & Communication
                    </SelectItem>
                    <SelectItem value="Chemical">
                      Chemical Engineering
                    </SelectItem>
                    <SelectItem value="Aerospace">
                      Aerospace Engineering
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="year"
                  className="text-sm font-medium text-slate-700"
                >
                  Year *
                </Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) =>
                    setFormData({ ...formData, year: value })
                  }
                >
                  <SelectTrigger className="border-slate-300 focus:border-primary focus:ring-primary">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm font-medium text-slate-700"
              >
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter complete address"
                className="border-slate-300 focus:border-primary focus:ring-primary"
                rows={3}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 px-6 sm:px-8 w-full sm:w-auto"
              >
                Add Student
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddStudent;
