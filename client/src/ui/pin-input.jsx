import React from "react";
import { HStack, PinInput, PinInputField } from "@chakra-ui/react";

export default function PinInput() {
    return (
      <HStack>
        <PinInput type="alphanumeric">
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
        </PinInput>
      </HStack>
    );
}
