"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const courtSchema = z.object({
  name: z.string().min(1, "Court name is required"),
  sport: z.string().min(1, "Sport is required"),
  pricePerHour: z.number().min(1, "Price must be greater than 0"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  description: z.string().optional(),
});

const venueSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  courts: z.array(courtSchema).min(1, "At least one court is required"),
});

type VenueForm = z.infer<typeof venueSchema>;

const SPORTS = [
  "Basketball",
  "Tennis",
  "Badminton",
  "Volleyball",
  "Football",
  "Cricket",
  "Table Tennis",
  "Squash",
  "Swimming",
  "Gym",
];

const AMENITIES = [
  "Parking",
  "WiFi",
  "Changing Rooms",
  "Showers",
  "Equipment Rental",
  "Cafeteria",
  "Air Conditioning",
  "Lighting",
  "Sound System",
  "First Aid",
];

interface EnhancedVenueFormProps {
  venueId?: string;
  isEdit?: boolean;
}

export default function EnhancedVenueForm({
  venueId,
  isEdit = false,
}: EnhancedVenueFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(isEdit);
  const router = useRouter();

  const form = useForm<VenueForm>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      latitude: 0,
      longitude: 0,
      images: [],
      amenities: [],
      courts: [
        { name: "", sport: "", pricePerHour: 0, capacity: 1, description: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "courts",
  });

  // Fetch venue data for editing
  useEffect(() => {
    if (isEdit && venueId) {
      fetchVenueData();
    }
  }, [isEdit, venueId]);

  const fetchVenueData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/venues/${venueId}`);
      if (response.ok) {
        const venue = await response.json();

        // Set form values
        form.reset({
          name: venue.name,
          description: venue.description || "",
          address: venue.address,
          city: venue.city,
          state: venue.state,
          zipCode: venue.zipCode,
          latitude: venue.latitude || 0,
          longitude: venue.longitude || 0,
          images: venue.images || [],
          amenities: venue.amenities || [],
          courts: venue.courts.map((court: any) => ({
            name: court.name,
            sport: court.sport,
            pricePerHour: court.pricePerHour,
            capacity: court.capacity || 1,
            description: court.description || "",
          })),
        });

        // Set uploaded images
        setUploadedImages(venue.images || []);
      } else {
        toast.error("Failed to load venue data");
        router.push("/owner/dashboard");
      }
    } catch (error) {
      console.error("Error fetching venue:", error);
      toast.error("Error loading venue data");
      router.push("/owner/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { urls } = await response.json();
        setUploadedImages((prev) => [...prev, ...urls]);
        form.setValue("images", [...uploadedImages, ...urls]);
        toast.success("Images uploaded successfully");
      } else {
        toast.error("Failed to upload images");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error uploading images");
    }
  };

  const onSubmit = async (data: VenueForm) => {
    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/venues/${venueId}` : "/api/venues";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          images: uploadedImages,
        }),
      });

      if (response.ok) {
        toast.success(
          isEdit ? "Venue updated successfully!" : "Venue created successfully!"
        );
        router.push("/owner/dashboard");
      } else {
        const error = await response.text();
        toast.error(
          error ||
            (isEdit ? "Failed to update venue" : "Failed to create venue")
        );
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(isEdit ? "Failed to update venue" : "Failed to create venue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading venue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          {isEdit ? "Edit Venue" : "Create New Venue"}
        </h1>
        <p className="text-gray-600">
          {isEdit
            ? "Update your venue information"
            : "Add your sports facility to our platform"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about your venue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter venue name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your venue..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Where is your venue located?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="ZIP Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Upload photos of your venue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label htmlFor="images" className="cursor-pointer block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <span className="mt-2 block text-sm font-medium text-foreground">
                        Click to upload images
                      </span>
                    </div>
                  </div>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </label>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => {
                            const newImages = uploadedImages.filter(
                              (_, i) => i !== index
                            );
                            setUploadedImages(newImages);
                            form.setValue("images", newImages);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>What facilities do you offer?</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="amenities"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 gap-4">
                      {AMENITIES.map((amenity) => (
                        <FormField
                          key={amenity}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(amenity)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            amenity,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== amenity
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {amenity}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Courts */}
          <Card>
            <CardHeader>
              <CardTitle>Courts/Facilities</CardTitle>
              <CardDescription>
                Add the courts or facilities available at your venue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Court {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`courts.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Court Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Court A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`courts.${index}.sport`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sport</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sport" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SPORTS.map((sport) => (
                                <SelectItem key={sport} value={sport}>
                                  {sport}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`courts.${index}.pricePerHour`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Hour (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`courts.${index}.capacity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 1)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`courts.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Court Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional details about this court..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    name: "",
                    sport: "",
                    pricePerHour: 0,
                    capacity: 1,
                    description: "",
                  })
                }
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Court
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                ? "Update Venue"
                : "Create Venue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
