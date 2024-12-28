import React from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { Box, Container } from "@chakra-ui/react";

export const Root = () => {
  return (
    <Box bg="gray.100" minHeight="100vh">
      <Navigation />
      <Container maxW="container.lg" py={4}>
        <Outlet />
      </Container>
    </Box>
  );
};
