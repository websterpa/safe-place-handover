import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CameraCapture, { CameraCaptureHandle } from "@/components/CameraCapture";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera } from "lucide-react";

// Define UK phone number regex pattern
const ukPhoneRegex = /^(?:(?:\+44\s?|0)7\d{3}\s?\d{6})$/;

// Define email regex pattern
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Define the finder form schema
const finderFormSchema = z.object({
  finderFirstName: z.string().min(1, "First name is required"),
  finderLastName: z.string().min(1, "Last name is required"),
  finderContact: z.string().min(1, "Office or mobile phone number is required")
    .refine(val => emailRegex.test(val) || ukPhoneRegex.test(val), {
      message: "Enter a valid email address or UK mobile number (e.g., 07123456789 or +447123456789)",
    }),
  itemDescription: z.string().min(1, "Item description is required"),
});

export type FinderFormValues = z.infer<typeof finderFormSchema>;

interface FinderFormProps {
  onSubmit: (values: FinderFormValues) => void;
  onPhotoCapture: (photoData: string) => void;
}

const FinderForm: React.FC<FinderFormProps> = ({ onSubmit, onPhotoCapture }) => {
  const form = useForm<FinderFormValues>({
    resolver: zodResolver(finderFormSchema),
    defaultValues: {
      finderFirstName: "",
      finderLastName: "",
      finderContact: "",
      itemDescription: "",
    },
  });
  
  const cameraRef = useRef<CameraCaptureHandle>(null);
  const [photoSaved, setPhotoSaved] = React.useState(false);
  
  const handlePhotoCapture = (photoData: string) => {
    console.log("Photo captured and saved in FinderForm");
    setPhotoSaved(true);
    onPhotoCapture(photoData);
  };
  
  const handleSubmit = (values: FinderFormValues) => {
    console.log("Form submission attempted, photoSaved:", photoSaved);
    
    if (!photoSaved) {
      console.log("Photo not saved, showing error message");
      form.setError("root", { 
        type: "manual",
        message: "Please take and save a photo of the item before submitting" 
      });
      return;
    }
    
    console.log("Proceeding with form submission as photo is saved");
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="finderFirstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="finderLastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="finderContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Office or Mobile phone number</FormLabel>
              <FormControl>
                <Input placeholder="Email or UK mobile number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="itemDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Briefly describe the found item" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Camera className="mr-2 h-4 w-4" /> 
            Lost Item Photo
          </h3>
          
          <CameraCapture ref={cameraRef} onPhotoCapture={handlePhotoCapture} />
          
          {photoSaved && (
            <Alert className="mt-4" variant="info">
              <AlertDescription>Photo successfully captured and saved!</AlertDescription>
            </Alert>
          )}
        </div>
        
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        )}
        
        <div className="pt-4">
          <Button type="submit" className="w-full">
            Continue to Recipient
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FinderForm;
