"use client";
import { Tabs } from "@radix-ui/themes";
import { CONVERSION_TABS, type TabValue, useConverter } from "./ConverterContext";
import FileUploadZone from "./FileUploadZone";
import ConversionLayout from "./ConversionLayout";

function TabPanel({ value }: { value: string }) {
    const { fileName } = useConverter();
    const hasFile = !!fileName;

    return (
        <Tabs.Content value={value}>
            {hasFile ? <ConversionLayout /> : <FileUploadZone />}
        </Tabs.Content>
    );
}

export default function ConverterTabs() {
    const { activeTab, setActiveTab, reset } = useConverter();

    const handleTabChange = (value: string) => {
        reset();
        setActiveTab(value as TabValue);
    };

    return (
        <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
            <Tabs.List style={{ "--accent-indicator": "var(--lime-6)" } as React.CSSProperties}>
                {CONVERSION_TABS.map(({ value, label }) => (
                    <Tabs.Trigger key={value} value={value} style={{ color: "var(--lime-12)", fontWeight: "bold" } as React.CSSProperties}>
                        {label}
                    </Tabs.Trigger>
                ))}
            </Tabs.List>

            {CONVERSION_TABS.map(({ value }) => (
                <TabPanel key={value} value={value} />
            ))}
        </Tabs.Root>
    );
}
