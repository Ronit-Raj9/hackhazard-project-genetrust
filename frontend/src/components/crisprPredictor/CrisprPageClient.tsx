'use client';

import React from 'react';
import { Container, Heading, Text, Box, VStack } from '@chakra-ui/react';
import CrisprPredictor from '@/components/crisprPredictor/CrisprPredictor';
import { PageHeader } from '@/components/layouts/PageHeader';

export default function CrisprPageClient() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <PageHeader
          title="CRISPR Sequence Predictor"
          subtitle="Optimize your CRISPR gene editing experiments with AI-powered sequence predictions"
        />
        
        <Box mb={6}>
          <Text fontSize="lg">
            Our CRISPR sequence prediction tool uses deep learning to analyze your DNA sequences 
            and suggest optimal edits to improve CRISPR-Cas9 efficiency. Simply enter your 
            target 20-base sequence, and our model will predict the most effective edit.
          </Text>
        </Box>

        <CrisprPredictor />
      </VStack>
    </Container>
  );
} 