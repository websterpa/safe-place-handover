
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isHandoverExpired } from "@/utils/uuid";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface HandoverData {
  staffName: string;
  staffRole: string;
  staffContact: string;
  acceptResponsibility: boolean;
}

interface HandoverRecord {
  id: string;
  handoverId: string;
  staffName: string;
  staffRole: string;
  staffContact: string;
  confirmed: boolean;
  submittedAt: string;
}

const Handover = () => {
  const [searchParams] = useSearchParams();
  const handoverId = searchParams.get("id");
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<HandoverData>({
    staffName: "",
    staffRole: "",
    staffContact: "",
    acceptResponsibility: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating checking if the handover link exists and is valid
    const checkHandover = async () => {
      if (!handoverId) {
        setIsLoading(false);
        return;
      }

      try {
        // In a real implementation, this would fetch from a database
        // For now, we'll simulate an API call with a timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate checking if handover is expired
        // In real implementation, you'd fetch the creation timestamp from DB
        const mockTimestamp = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
        setIsExpired(isHandoverExpired(mockTimestamp));
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking handover:", error);
        toast({
          title: "Error",
          description: "Failed to load handover details",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    checkHandover();
  }, [handoverId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, acceptResponsibility: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.staffName.trim()) {
      toast({
        title: "Required field missing",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.acceptResponsibility) {
      toast({
        title: "Acceptance required",
        description: "You must accept responsibility for the item",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would be an API call to store the data
      // For demo purposes, we'll log the data and simulate an API call
      const handoverRecord: HandoverRecord = {
        id: crypto.randomUUID(),
        handoverId: handoverId || "",
        staffName: formData.staffName,
        staffRole: formData.staffRole,
        staffContact: formData.staffContact,
        confirmed: true,
        submittedAt: new Date().toISOString(),
      };
      
      console.log("Submitting handover record:", handoverRecord);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success and update UI
      setIsSubmitted(true);
      toast({
        title: "Handover confirmed",
        description: "Item has been successfully handed over",
      });
    } catch (error) {
      console.error("Error submitting handover:", error);
      toast({
        title: "Submission failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 animate-spin text-blue-600" />
              <p>Loading handover details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!handoverId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invalid Handover</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="mb-4">This handover link is invalid or has been removed.</p>
            <Button onClick={() => window.location.href = "/"}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-amber-600">Handover Expired</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Clock className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <p className="mb-4">This handover link has expired. Please request a new handover.</p>
            <Button onClick={() => window.location.href = "/"}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">iFoundIt</h1>
          <p className="text-gray-600">Safe Place Handover</p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Safe Item Handover</CardTitle>
            <CardDescription>
              Please complete this form to confirm receipt of the item
            </CardDescription>
          </CardHeader>
          
          {!isSubmitted ? (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staffName">Full Name *</Label>
                  <Input 
                    id="staffName"
                    name="staffName"
                    value={formData.staffName}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="staffRole">Role (optional)</Label>
                  <Input 
                    id="staffRole"
                    name="staffRole"
                    value={formData.staffRole}
                    onChange={handleInputChange}
                    placeholder="Your role or position"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="staffContact">Contact (optional)</Label>
                  <Input 
                    id="staffContact"
                    name="staffContact"
                    value={formData.staffContact}
                    onChange={handleInputChange}
                    placeholder="Email or phone number"
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="acceptResponsibility"
                    checked={formData.acceptResponsibility}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label 
                    htmlFor="acceptResponsibility" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I accept responsibility for this item *
                  </Label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Confirm Handover"}
                </Button>
              </form>
            </CardContent>
          ) : (
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-600 mb-2">Handover Successful</h3>
              <p className="mb-6">
                Thank you {formData.staffName}. The item has been successfully handed over to you.
              </p>
              <Button onClick={() => window.location.href = "/"}>Done</Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Handover;
