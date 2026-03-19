"use client";
import dynamic from "next/dynamic";
import React from "react";
import { Flex, Link, Section, Text } from "@radix-ui/themes";
const HomeHeader = dynamic(() => import('./HomeHeader'),
{ ssr: false })
const Education = dynamic(() => import('./education/Education'),
{ ssr: false })
const Experience = dynamic(() => import('./experiences/Experience'),
{ ssr: false })

export default function HomeView() {

  return (
    <Section className="!pt-2.5 pl-2 relative h-[100vh] overflow-auto">
      <HomeHeader />
      <Experience />
      <Education />
      <Flex justify="center" py="6">
        <Link href="/en/privacy" size="2" color="gray">Privacy Policy</Link>
      </Flex>
    </Section>
  );
}