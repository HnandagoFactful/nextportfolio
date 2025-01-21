import { ChangeEventHandler } from "react"
import isNil from "lodash.isnil"
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { Card, Flex, Checkbox, TextField, IconButton, Text } from "@radix-ui/themes"

export interface ICropperControlInput {
    label: string;
    value: number | undefined;
    step: number;
    withCheckBox?: boolean;
    placeholder?: string;
    updaterPlus: () => void;
    updaterMinus: () => void;
    onCheckedChange?: (value: boolean) => void;
    onChange: ChangeEventHandler<HTMLInputElement>;
    defaultUpdater: (value: number) => void;
}

export default function CropperControlInput({
    label,
    value,
    step,
    withCheckBox = false,
    placeholder = "Increase or decrease value",
    updaterPlus,
    updaterMinus,
    onCheckedChange,
    onChange,
}: ICropperControlInput) {
    return (
        <Card className="min-w-[100px]">
            <Text as="label" size="2">
            {withCheckBox ? (<Flex gap="2">
                <Checkbox color="lime" checked={!isNil(value)} onCheckedChange={onCheckedChange} />
                {label}
            </Flex>) : label}
            </Text>
            <TextField.Root className="w-[100px]" radius="none" size="2"
                color="lime"
                type="number"
                value={value ?? -1}
                step={step}
                placeholder={placeholder}
                onChange={onChange}>
                <TextField.Slot>
                    <IconButton size="1" variant="ghost" onClick={updaterPlus} 
                >
                    <ChevronUpIcon height="18" width="18" />
                    </IconButton>
                </TextField.Slot>
                <TextField.Slot>
                    <IconButton size="1" variant="ghost" onClick={updaterMinus}>
                    <ChevronDownIcon height="18" width="18" />
                    </IconButton>
                </TextField.Slot>
            </TextField.Root>
        </Card>
    )
}