import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Image,
  Text,
  Flex,
  Button,
  Spinner,
  Grid,
  Input,
  Select,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { useNavigate, Link } from "react-router-dom";

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:3000/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
        setFilteredEvents(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3000/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchEvents();
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    filterEvents(e.target.value, selectedCategory);
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
    filterEvents(searchTerm, e.target.value);
  };

  const filterEvents = (search, category) => {
    let filtered = events;

    if (search) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(search.toLowerCase()) ||
          event.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter((event) =>
        event.categoryIds.includes(parseInt(category))
      );
    }

    setFilteredEvents(filtered);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" variant="solid" mb={4}>
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Heading as="h1" size="xl" mb={5} textAlign="center">
        All Events
      </Heading>

      <Button
        onClick={() => navigate("/add-event")}
        colorScheme="yellow"
        mb={5}
        size={{ base: "sm", md: "md" }}
      >
        Add New Event
      </Button>

      <Input
        placeholder="Search events..."
        value={searchTerm}
        onChange={handleSearch}
        mb={5}
        size={{ base: "sm", md: "md" }}
      />

      <Select
        placeholder="Filter by category"
        value={selectedCategory}
        onChange={handleCategoryFilter}
        mb={5}
        size={{ base: "sm", md: "md" }}
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      <Button
        onClick={() => {
          setSearchTerm("");
          setSelectedCategory("");
          filterEvents("", "");
        }}
        mb={5}
        size={{ base: "sm", md: "md" }}
      >
        Clear Filters
      </Button>

      {filteredEvents.length === 0 ? (
        <Text>No events found matching your criteria.</Text>
      ) : (
        <Grid
          templateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(auto-fill, minmax(250px, 1fr))",
          }}
          gap={6}
        >
          {filteredEvents.map((event) => (
            <Box
              key={event.id}
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="lg"
              bg="white"
            >
              <Image
                src={event.image}
                alt={event.title}
                height="200px"
                objectFit="cover"
                width="100%"
                borderTopRadius="lg"
              />
              <Box p={5}>
                <Heading size="md" color="yellow.600">
                  <Link to={`/event/${event.id}`}>{event.title}</Link>{" "}
                </Heading>
                <Text
                  mt={2}
                  color="gray.700"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  {event.description}
                </Text>
                <Text mt={2} fontSize="sm" color="gray.500">
                  {event.location}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {format(new Date(event.startTime), "MMMM dd, yyyy h:mm a")} -{" "}
                  {format(new Date(event.endTime), "MMMM dd, yyyy h:mm a")}
                </Text>
                <Button
                  mt={4}
                  colorScheme="yellow"
                  size="sm"
                  width="full"
                  _hover={{ bg: "teal.500" }}
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  View Event
                </Button>
              </Box>
            </Box>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default EventsPage;
