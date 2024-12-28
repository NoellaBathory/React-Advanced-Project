import React, { useState, useEffect } from "react";
import {
  Box,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Button,
  Alert,
  AlertIcon,
  Heading,
  Select,
  FormHelperText,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const AddEventPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [image, setImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3000/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategoryOptions(data);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    if (
      !title ||
      !description ||
      !location ||
      !startTime ||
      !endTime ||
      !image ||
      categories.length === 0
    ) {
      return false;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fill all the required fields correctly.");
      return;
    }

    setIsSubmitting(true);

    const newEvent = {
      title,
      description,
      location,
      startTime,
      endTime,
      image,
      categoryIds: categories,
    };

    try {
      const response = await fetch("http://localhost:3000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error("Failed to add event");
      }

      const createdEvent = await response.json();

      toast({
        title: "Event added successfully!",
        description: `Your event "${createdEvent.title}" has been successfully created.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate(`/event/${createdEvent.id}`);

      setTitle("");
      setDescription("");
      setLocation("");
      setStartTime("");
      setEndTime("");
      setImage("");
      setCategories([]);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box p={5}>
      <Heading as="h1" size="xl" mb={5}>
        Add New Event
      </Heading>
      {error && (
        <Alert status="error" variant="solid" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event Title"
            mb={4}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event Description"
            mb={4}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Location</FormLabel>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            mb={4}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Start Time</FormLabel>
          <Input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            mb={4}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>End Time</FormLabel>
          <Input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            mb={4}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Image URL</FormLabel>
          <Input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Image URL"
            mb={4}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Categories</FormLabel>
          <Select
            value={categories}
            onChange={(e) =>
              setCategories(
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
            placeholder="Select categories"
            multiple
            mb={4}
          >
            {categoryOptions.map((category, index) => (
              <option key={index} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <FormHelperText>Select at least one category</FormHelperText>
        </FormControl>
        <Button
          type="submit"
          colorScheme="teal"
          size="lg"
          width="full"
          isLoading={isSubmitting}
        >
          Add Event
        </Button>
      </form>
    </Box>
  );
};

export default AddEventPage;
