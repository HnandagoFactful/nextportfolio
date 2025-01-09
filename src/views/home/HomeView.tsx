import { Section, Text } from "@radix-ui/themes";
import React from "react";
import TwoColResponsiveLayout from "@/components/layouts/TwoColResponsiveLayout";

export default function HomeView() {

  return (
    <Section className="!pt-0">
      <TwoColResponsiveLayout rowHeight={50}>
        <Text>1</Text>
        <Text>21</Text>
        <Text>213</Text>
      </TwoColResponsiveLayout>
    </Section>
  );
}