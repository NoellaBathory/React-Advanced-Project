import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Image,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { format } from "date-fns";
import data from "../events.json";

export const EventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const toast = useToast();
  const [categoriesList] = useState(data.categories);
  const { users } = data;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`http://localhost:3000/events/${eventId}`);
        if (!response.ok) {
          throw new Error("Event not found");
        }
        const data = await response.json();
        setEvent(data);
        setFormData({
          title: data.title,
          description: data.description,
          startTime: data.startTime,
          endTime: data.endTime,
          categoryIds: data.categoryIds || [],
          image: data.image || "",
          location: data.location || "",
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;

    if (type === "select-multiple") {
      const selectedValues = Array.from(
        selectedOptions,
        (option) => option.value
      );
      setFormData((prevData) => ({
        ...prevData,
        [name]: selectedValues,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleEditEvent = async () => {
    try {
      const response = await fetch(`http://localhost:3000/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      toast({
        title: "Event updated.",
        description: "The event has been successfully updated.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      onEditClose();

      window.location.reload();
    } catch (error) {
      toast({
        title: "Error.",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleDeleteEvent = async () => {
    try {
      const response = await fetch(`http://localhost:3000/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      toast({
        title: "Event deleted.",
        description: "The event has been successfully deleted.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      onDeleteClose();
      navigate("/");
    } catch (error) {
      toast({
        title: "Error.",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  const categories = event?.categoryIds || [];

  const creator = users.find((user) => user.id === event.createdBy);

  return (
    <Box p={5}>
      <Heading as="h1" size="xl" mb={5}>
        {event.title}
      </Heading>

      <Box display="flex" justifyContent="space-between" mb={5}>
        <Box display="flex" alignItems="center">
          {creator ? (
            <>
              <Image
                src={creator.image}
                alt={creator.name}
                borderRadius="full"
                boxSize="40px"
                mr={3}
              />
              <Text fontWeight="bold">{creator.name}</Text>
            </>
          ) : (
            <>
              <Image
                src="default_image.jpg"
                alt="Unknown creator"
                borderRadius="full"
                boxSize="40px"
                mr={3}
              />
              <Text fontWeight="bold">Unknown Creator</Text>
            </>
          )}
        </Box>
        <Box>
          <Button colorScheme="yellow" onClick={onEditOpen} mr={3}>
            Edit
          </Button>
          <Button colorScheme="red" onClick={onDeleteOpen}>
            Delete
          </Button>
        </Box>
      </Box>

      <Image
        src={event.image || "default_image.jpg"}
        alt={event.title}
        borderRadius="md"
        mb={5}
      />
      <Text mb={5}>{event.description}</Text>
      <Text>
        <strong>Start Time:</strong>{" "}
        {format(new Date(event.startTime), "MMMM dd, yyyy h:mm a")}
      </Text>
      <Text mb={5}>
        <strong>End Time:</strong>{" "}
        {format(new Date(event.endTime), "MMMM dd, yyyy h:mm a")}
      </Text>

      <Text mb={5}>
        <strong>Location:</strong> {event.location || "No location specified"}
      </Text>

      <Box mb={5}>
        <strong>Categories:</strong>
        {categories.length > 0 ? (
          <ul>
            {categories.map((categoryId) => {
              const category = categoriesList.find(
                (cat) => cat.id === categoryId
              );
              return <li key={categoryId}>{category?.name}</li>;
            })}
          </ul>
        ) : (
          <Text>No categories available</Text>
        )}
      </Box>

      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Title</FormLabel>
              <Input
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Start Time</FormLabel>
              <Input
                type="datetime-local"
                name="startTime"
                value={formData.startTime || ""}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>End Time</FormLabel>
              <Input
                type="datetime-local"
                name="endTime"
                value={formData.endTime || ""}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                placeholder="Enter event location"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Image</FormLabel>
              <Input
                type="text"
                name="image"
                value={formData.image || ""}
                onChange={handleChange}
                placeholder="Enter image URL"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Categories</FormLabel>
              <Select
                name="categoryIds"
                multiple
                value={formData.categoryIds || []}
                onChange={handleChange}
              >
                {categoriesList.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <Button colorScheme="teal" onClick={handleEditEvent} width="full">
              Save Changes
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </Text>
            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button onClick={onDeleteClose}>Cancel</Button>
              <Button colorScheme="red" onClick={handleDeleteEvent}>
                Delete
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EventPage;
