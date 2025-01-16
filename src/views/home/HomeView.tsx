"use client";
import { Section } from "@radix-ui/themes";
import React from "react";
import HomeHeader from "./HomeHeader";
import Education from "./education/Education";
import Experience from "./experiences/Experience";

export default function HomeView() {

  return (
    <Section className="pt-8 pl-2 relative">
      <HomeHeader />
      <Experience />
      <Education />
    </Section>
  );
}