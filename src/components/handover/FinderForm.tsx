
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

// Define the finder form schema
const finderFormSchema = z.object({
  finderName: z.string().min(1, "Name is required"),
  finderContact: z.string().optional(),
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
      finderName: "",
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
    if (!photoSaved) {
      form.setError("root", { 
        type: "manual",
        message: "Please take and save a photo of the item before submitting" 
      });
      return;
    }
    
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="finderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="finderContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Information (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Email or phone number" {...field} />
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
            Item Photo
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
