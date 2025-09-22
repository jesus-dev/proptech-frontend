"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Partner, partnerService } from "../../services/partnerService";
import PartnerForm from "../../components/PartnerForm";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function EditPartnerPage() {
  const params = useParams();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  const partnerId = Number(params.id);

  useEffect(() => {
    if (partnerId) {
      loadPartner();
    }
  }, [partnerId]);

  const loadPartner = async () => {
    try {
      setLoading(true);
      const data = await partnerService.getPartnerById(partnerId);
      setPartner(data);
    } catch (error) {
      console.error("Error loading partner:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Socio no encontrado
          </h2>
        </div>
      </div>
    );
  }

  return <PartnerForm partner={partner} isEditing={true} />;
} 