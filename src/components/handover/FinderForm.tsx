
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CameraCapture from "@/components/CameraCapture";

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        
        {/* Add camera capture component */}
        <CameraCapture onPhotoCapture={onPhotoCapture} />
        
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
