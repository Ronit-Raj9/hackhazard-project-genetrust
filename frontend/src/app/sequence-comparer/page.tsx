"use client";

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import { SequenceComparer } from "@/components/ui/sequence-comparer";

export default function SequenceComparerPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">DNA Sequence Comparison Tool</h1>
      <p className="mb-8 text-muted-foreground">
        Compare two DNA sequences to identify and visualize differences. 
        Paste your sequences in the input tab, then switch to the comparison tab to see the results.
      </p>
      
      <SequenceComparer 
        originalSequence="ATGCTAGCTAGCTAGCTAGCTAGCTAGCTAGGCATCGATCGAT"
        editedSequence="ATGCTAGCGAGCTAGCTAGCAAACTAGCTAGGCATCGATCGAT" 
      />
    </div>
  );
} 