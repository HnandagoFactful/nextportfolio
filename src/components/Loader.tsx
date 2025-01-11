import { AlertDialog, Flex, Spinner } from "@radix-ui/themes";

export default function Loader({ open = false }: { open?: boolean }) {
    if (!open) {
        return null;
    }

    return (<AlertDialog.Root open>
        <AlertDialog.Content maxWidth="450px" align="center">
            <Flex align={"center"} justify={"center"}>
                <Spinner />
            </Flex>
        </AlertDialog.Content>
    </AlertDialog.Root>)

}