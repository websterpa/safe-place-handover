
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { isHandoverExpired } from "@/utils/uuid";
import { Check, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Define the finder form schema
const finderFormSchema = z.object({
  finderName: z.string().min(1, "Name is required"),
  finderContact: z.string().optional(),
  itemDescription: z.string().min(1, "Item description is required"),
});

// Define the recipient form schema
const recipientFormSchema = z.object({
  staffName: z.string().min(1, "Name is required"),
  staffRole: z.string().optional(),
  staffContact: z.string().optional(),
  confirmed: z.boolean().refine(val => val === true, {
    message: "You must confirm receipt of the item",
  }),
});

type FinderFormValues = z.infer<typeof finderFormSchema>;
type RecipientFormValues = z.infer<typeof recipientFormSchema>;

const DirectHandover = () => {
  const [searchParams] = useSearchParams();
  const handoverId = searchParams.get("id");
  const { toast } = useToast();
  
  const [finderSubmitted, setFinderSubmitted] = useState(false);
  const [handoverCompleted, setHandoverCompleted] = useState(false);
  const [createdAt] = useState(new Date().toISOString());

  // Check if the handover link is valid
  const isExpired = handoverId && localStorage.getItem(handoverId) 
    ? isHandoverExpired(JSON.parse(localStorage.getItem(handoverId)!).createdAt) 
    : false;

  // Initialize finder form
  const finderForm = useForm<FinderFormValues>({
    resolver: zodResolver(finderFormSchema),
    defaultValues: {
      finderName: "",
      finderContact: "",
      itemDescription: "",
    },
  });

  // Initialize recipient form
  const recipientForm = useForm<RecipientFormValues>({
    resolver: zodResolver(recipientFormSchema),
    defaultValues: {
      staffName: "",
      staffRole: "",
      staffContact: "",
      confirmed: false,
    },
  });

  // Handle finder form submission
  const onFinderSubmit = (values: FinderFormValues) => {
    if (handoverId) {
      // Save finder data to localStorage
      localStorage.setItem(handoverId, JSON.stringify({
        ...values,
        handoverId,
        createdAt,
        status: 'awaiting_recipient'
      }));
      
      setFinderSubmitted(true);
      
      toast({
        title: "Finder information submitted",
        description: "Please pass the device to the recipient to complete the handover",
      });
    }
  };

  // Handle recipient form submission
  const onRecipientSubmit = (values: RecipientFormValues) => {
    if (handoverId) {
      const finderData = JSON.parse(localStorage.getItem(handoverId) || "{}");
      
      // Update the stored data with recipient information
      const handoverData = {
        ...finderData,
        ...values,
        submittedAt: new Date().toISOString(),
        status: 'completed'
      };
      
      localStorage.setItem(handoverId, JSON.stringify(handoverData));
      
      setHandoverCompleted(true);
      
      toast({
        title: "Handover completed",
        description: "The direct handover has been successfully recorded",
      });
    }
  };

  // Render expired message if the link is expired
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-red-600">Handover Link Expired</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-gray-600">
                This handover link has expired. Handover links are valid for 6 hours from creation.
              </p>
              <Button asChild className="w-full">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Home
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render success message if the handover is completed
  if (handoverCompleted) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-green-600">Handover Successful</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <Check className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <p className="text-center text-gray-600">
                The direct handover has been successfully completed and recorded.
              </p>
              <Button asChild className="w-full">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Home
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render the finder form if not yet submitted
  if (!finderSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-md mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">iFoundIt.io</h1>
            <p className="text-gray-600">Direct Handover - Finder Information</p>
          </header>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Finder Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...finderForm}>
                <form onSubmit={finderForm.handleSubmit(onFinderSubmit)} className="space-y-4">
                  <FormField
                    control={finderForm.control}
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
                    control={finderForm.control}
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
                    control={finderForm.control}
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
                  
                  <div className="pt-4">
                    <Button type="submit" className="w-full">
                      Continue to Recipient
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render the recipient form if finder info is submitted
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">iFoundIt.io</h1>
          <p className="text-gray-600">Direct Handover - Recipient Information</p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Recipient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...recipientForm}>
              <form onSubmit={recipientForm.handleSubmit(onRecipientSubmit)} className="space-y-4">
                <FormField
                  control={recipientForm.control}
                  name="staffName"
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
                  control={recipientForm.control}
                  name="staffRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role/Position (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Store Manager, Security Officer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={recipientForm.control}
                  name="staffContact"
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
                  control={recipientForm.control}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DirectHandover;
