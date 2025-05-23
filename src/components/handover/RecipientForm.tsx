
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

// Define UK phone number regex pattern
const ukPhoneRegex = /^(?:(?:\+44\s?|0)7\d{3}\s?\d{6})$/;

// Define email regex pattern
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Define the recipient form schema with first name and last name
const recipientFormSchema = z.object({
  staffFirstName: z.string().min(1, "First name is required"),
  staffLastName: z.string().min(1, "Last name is required"),
  staffRole: z.string().min(1, "Role/Position is required"),
  staffContact: z.string().min(1, "Office or mobile phone number is required")
    .refine(val => emailRegex.test(val) || ukPhoneRegex.test(val), {
      message: "Enter a valid email address or UK mobile number (e.g., 07123456789 or +447123456789)",
    }),
  confirmed: z.boolean().refine(val => val === true, {
    message: "You must confirm receipt of the item",
  }),
});

export type RecipientFormValues = z.infer<typeof recipientFormSchema>;

interface RecipientFormProps {
  onSubmit: (values: RecipientFormValues) => void;
  itemPhoto: string | null;
}

const RecipientForm: React.FC<RecipientFormProps> = ({ onSubmit, itemPhoto }) => {
  const form = useForm<RecipientFormValues>({
    resolver: zodResolver(recipientFormSchema),
    defaultValues: {
      staffFirstName: "",
      staffLastName: "",
      staffRole: "",
      staffContact: "",
      confirmed: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Display the item photo if available */}
        {itemPhoto && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Lost Item Photo</h3>
            <div className="border rounded-lg overflow-hidden">
              <img 
                src={itemPhoto} 
                alt="Item" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="staffFirstName"
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
            name="staffLastName"
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
          name="staffRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role/Position</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Store Manager, Security Officer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="staffContact"
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
          name="confirmed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-4">
              <FormControl>
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I confirm that I have received this item and accept responsibility for it
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        <div className="pt-4">
          <Button type="submit" className="w-full">
            Complete Handover
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RecipientForm;
