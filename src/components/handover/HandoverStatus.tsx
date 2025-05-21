
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft } from "lucide-react";

interface HandoverStatusProps {
  status: "expired" | "success";
}

const HandoverStatus: React.FC<HandoverStatusProps> = ({ status }) => {
  const isExpired = status === "expired";

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className={`text-center text-2xl ${isExpired ? "text-red-600" : "text-green-600"}`}>
              {isExpired ? "Handover Link Expired" : "Handover Successful"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isExpired && (
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <Check className="h-12 w-12 text-green-600" />
                </div>
              </div>
            )}
            <p className="text-center text-gray-600">
              {isExpired 
                ? "This handover link has expired. Handover links are valid for 6 hours from creation."
                : "The direct handover has been successfully completed and recorded."
              }
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
};

export default HandoverStatus;
