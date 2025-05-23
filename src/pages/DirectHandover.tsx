
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isHandoverExpired } from "@/utils/uuid";
import FinderForm, { FinderFormValues } from "@/components/handover/FinderForm";
import RecipientForm, { RecipientFormValues } from "@/components/handover/RecipientForm";
import HandoverStatus from "@/components/handover/HandoverStatus";
import PageContainer from "@/components/handover/PageContainer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Camera } from "lucide-react";

const DirectHandover = () => {
  const [searchParams] = useSearchParams();
  const handoverId = searchParams.get("id");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [finderSubmitted, setFinderSubmitted] = useState(false);
  const [handoverCompleted, setHandoverCompleted] = useState(false);
  const [createdAt] = useState(new Date().toISOString());
  const [itemPhoto, setItemPhoto] = useState<string | null>(null);
  const [invalidHandover, setInvalidHandover] = useState(false);

  // Check if the handover ID is valid on component mount
  useEffect(() => {
    console.log("DirectHandover: Checking handover ID validity", handoverId);
    if (!handoverId) {
      console.error("No handover ID found in URL params");
      setInvalidHandover(true);
      toast({
        title: "Invalid Handover",
        description: "No handover ID found. Please return to the home page and try again.",
        variant: "destructive"
      });
    } else {
      const storedData = localStorage.getItem(handoverId);
      if (!storedData) {
        console.error("No stored data found for handover ID:", handoverId);
        setInvalidHandover(true);
      } else {
        console.log("Valid handover ID found:", handoverId);
        // Check if this handover already has photo data
        try {
          const parsedData = JSON.parse(storedData);
          if (parsedData.itemPhoto) {
            console.log("Found existing photo in storage, setting it");
            setItemPhoto(parsedData.itemPhoto);
          }
        } catch (err) {
          console.error("Error parsing stored handover data:", err);
        }
      }
    }
  }, [handoverId, toast]);

  // Check if the handover link is valid and not expired
  const isExpired = handoverId && localStorage.getItem(handoverId) 
    ? isHandoverExpired(JSON.parse(localStorage.getItem(handoverId)!).createdAt) 
    : false;

  // Handle photo capture
  const handlePhotoCapture = (photoData: string) => {
    console.log("Photo captured in parent component");
    setItemPhoto(photoData);
    
    // If there's already stored data for this handover, update it with the photo
    if (handoverId && localStorage.getItem(handoverId)) {
      try {
        const existingData = JSON.parse(localStorage.getItem(handoverId) || "{}");
        localStorage.setItem(handoverId, JSON.stringify({
          ...existingData,
          itemPhoto: photoData
        }));
        console.log("Updated existing handover data with photo");
      } catch (err) {
        console.error("Error updating handover data with photo:", err);
      }
    }
    
    toast({
      title: "Photo captured",
      description: "Item photo has been successfully captured."
    });
  };

  // Handle finder form submission
  const onFinderSubmit = (values: FinderFormValues) => {
    console.log("Finder form submitted:", values);
    if (handoverId) {
      // Combine first name and last name for storing
      const finderName = `${values.finderFirstName} ${values.finderLastName}`.trim();
      
      // Save finder data to localStorage
      localStorage.setItem(handoverId, JSON.stringify({
        ...values,
        finderName, // Add combined name for backward compatibility
        handoverId,
        createdAt,
        itemPhoto, // Include the item photo in the stored data
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
    console.log("Recipient form submitted:", values);
    if (handoverId) {
      const finderData = JSON.parse(localStorage.getItem(handoverId) || "{}");
      
      // Update the stored data with recipient information
      const handoverData = {
        ...finderData,
        ...values,
        // Generate a full name from first and last name for backward compatibility
        staffName: `${values.staffFirstName} ${values.staffLastName}`.trim(),
        submittedAt: new Date().toISOString(),
        status: 'completed'
      };
      
      localStorage.setItem(handoverId, JSON.stringify(handoverData));
      
      setHandoverCompleted(true);
      
      toast({
        title: "Handover completed",
        description: "The direct handover has been successfully recorded",
      });
      
      // Navigate to the report page instead of showing success status
      navigate(`/report?id=${handoverId}`);
    }
  };

  // Return to home page
  const goToHome = () => {
    navigate("/");
  };

  // Render error message if the handover is invalid
  if (invalidHandover) {
    return (
      <PageContainer title="iFoundIt" subtitle="Invalid Handover Request">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-red-600">Invalid Handover</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                This handover request is invalid or has been tampered with.
              </AlertDescription>
            </Alert>
            <Button onClick={goToHome} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Render expired message if the link is expired
  if (isExpired) {
    return <HandoverStatus status="expired" />;
  }

  // Render success message if the handover is completed but navigation failed
  if (handoverCompleted) {
    return <HandoverStatus status="success" />;
  }

  // Render the finder form if not yet submitted
  if (!finderSubmitted) {
    return (
      <PageContainer title="iFoundIt" subtitle="Person to Person - Finder Information">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Finder Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6" variant="info">
              <Camera className="h-4 w-4" />
              <AlertDescription>
                You'll need to use your camera to take a photo of the item. Please ensure you've granted camera permissions when prompted.
              </AlertDescription>
            </Alert>
            
            <FinderForm onSubmit={onFinderSubmit} onPhotoCapture={handlePhotoCapture} />
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Render the recipient form if finder info is submitted
  return (
    <PageContainer title="iFoundIt" subtitle="Person to Person - Recipient Information">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Recipient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <RecipientForm onSubmit={onRecipientSubmit} itemPhoto={itemPhoto} />
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default DirectHandover;
