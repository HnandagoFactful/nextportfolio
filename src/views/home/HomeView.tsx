"use client";
import dynamic from "next/dynamic";
import React from "react";
import { Flex, Link, Section } from "@radix-ui/themes";
const StarBackground = dynamic(() => import("@/components/globals/StarBackground"), { ssr: false });
const HomeHeader = dynamic(() => import('./HomeHeader'),
{ ssr: false })
const Education = dynamic(() => import('./education/Education'),
{ ssr: false })
const Experience = dynamic(() => import('./experiences/Experience'),
{ ssr: false })

export default function HomeView() {

  return (
    <Section className="!pt-2.5 pl-2 relative">
      <StarBackground />
      <HomeHeader />
      <Experience />
      <Education />
      <Flex justify="center" py="6">
        <Link href="/en/privacy" size="2" color="gray">Privacy Policy</Link>
      </Flex>
    </Section>
  );
}