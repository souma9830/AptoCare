import React from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  useColorModeValue,
  Image,
  useBreakpointValue,
  Container,
  Flex,
  Input
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { LockIcon, ViewIcon, CheckIcon, StarIcon, TimeIcon, SettingsIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";

/**
 * Landing page inspired by modern "bolt.new"–style SaaS sites.
 */

const blobFloat = keyframes`
  0% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
  100% { transform: translateY(0px) scale(1); }
`;

interface FeatureItem {
  title: string;
  description: string;
  icon: any;
  colorScheme: string;
  gradient: string;
}

const features: FeatureItem[] = [
  {
    title: "Secure Storage",
    description:
      "Your medical records are encrypted and stored on IPFS with tamper-proof hashes on-chain. Military-grade security meets blockchain immutability.",
    icon: LockIcon,
    colorScheme: "teal",
    gradient: "linear(to-br, teal.400, teal.600)"
  },
  {
    title: "Universal Access",
    description:
      "Your wallet is your universal key—view or share records anywhere, anytime. No more fragmented health data across providers.",
    icon: ViewIcon,
    colorScheme: "blue",
    gradient: "linear(to-br, blue.400, blue.600)"
  },
  {
    title: "Privacy Control",
    description: "You decide who sees what. Granular permissions with expiration dates put you in complete control.",
    icon: SettingsIcon,
    colorScheme: "purple",
    gradient: "linear(to-br, purple.400, purple.600)"
  },
  {
    title: "Instant Verification",
    description: "Prove your health status without revealing sensitive details. Zero-knowledge proofs for privacy.",
    icon: CheckIcon,
    colorScheme: "green",
    gradient: "linear(to-br, green.400, green.600)"
  },
  {
    title: "Always Available",
    description: "24/7 access from anywhere in the world. Decentralized infrastructure means no downtime.",
    icon: TimeIcon,
    colorScheme: "orange",
    gradient: "linear(to-br, orange.400, orange.600)"
  },
  {
    title: "Premium Features",
    description: "Get AI-powered health insights and personalized recommendations based on your medical history.",
    icon: StarIcon,
    colorScheme: "pink",
    gradient: "linear(to-br, pink.400, pink.600)"
  },
];

const FeatureCard = ({ feature }: { feature: FeatureItem }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <VStack
      align="start"
      spacing={6}
      bg={cardBg}
      borderRadius="2xl"
      p={8}
      boxShadow="lg"
      position="relative"
      overflow="hidden"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "xl",
      }}
      transition="all 0.3s ease"
      h="full"
    >
      {/* Gradient accent */}
      <Box
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="1"
        bgGradient={feature.gradient}
      />
      
      <Flex
        align="center"
        justify="center"
        w={12}
        h={12}
        borderRadius="xl"
        bgGradient={feature.gradient}
        color="white"
      >
        <Icon as={feature.icon} w={6} h={6} />
      </Flex>
      
      <VStack align="start" spacing={3}>
        <Heading as="h3" size="md" fontWeight="700">
          {feature.title}
        </Heading>
        <Text color={useColorModeValue("gray.600", "gray.400")} fontSize="md">
          {feature.description}
        </Text>
      </VStack>
      
      {!isMobile && (
        <Box
          position="absolute"
          bottom={-4}
          right={-4}
          w={24}
          h={24}
          bgGradient={feature.gradient}
          opacity={0.1}
          borderRadius="full"
          filter="blur(8px)"
        />
      )}
    </VStack>
  );
};

const FeaturesSection = () => {
  return (
    <Box as="section" py={{ base: 16, md: 28 }} px={{ base: 4, md: 8 }} bg={useColorModeValue("gray.50", "gray.900")}>
      <Container maxW="7xl">
        <VStack spacing={4} textAlign="center" mb={{ base: 12, md: 20 }}>
          <Text
            color={useColorModeValue("teal.500", "teal.300")}
            fontWeight="bold"
            letterSpacing="wide"
            textTransform="uppercase"
            fontSize="sm"
          >
            Why Choose Aptocare
          </Text>
          <Heading
            as="h2"
            fontSize={{ base: "3xl", md: "5xl" }}
            fontWeight="extrabold"
            lineHeight="1.2"
          >
            Your Health Data, <Box as="span" color={useColorModeValue("teal.500", "teal.300")}>Reimagined</Box>
          </Heading>
          <Text
            maxW="2xl"
            mx="auto"
            fontSize={{ base: "md", md: "xl" }}
            color={useColorModeValue("gray.600", "gray.400")}
          >
            We're building the future of medical records with blockchain technology that puts you in control.
          </Text>
        </VStack>

        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={{ base: 8, md: 10 }}
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { connected } = useWallet();

  const handleCTA = () => navigate(connected ? "/dashboard" : "/connect");

  const heroBg = useColorModeValue(
    "linear(to-br, teal.500, blue.600)",
    "linear(to-br, teal.500, blue.600)"
  );

  return (
    <Box>
      {/* Hero Section */}
      <Box
        as="section"
        minH="100vh"
        bgGradient={heroBg}
        px={{ base: 4, md: 16 }}
        py={{ base: 24, md: 32 }}
        position="relative"
        overflow="hidden"
      >
        {/* Floating blob animation */}
        <Box
          position="absolute"
          top="-20%"
          left="50%"
          transform="translateX(-50%)"
          w="160%"
          h="160%"
          bgGradient="radial(fuchsia.400 0%, transparent 70%)"
          filter="blur(160px)"
          animation={`${blobFloat} 12s ease-in-out infinite`}
          opacity={0.35}
          zIndex={0}
        />

        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          alignItems="center"
          spacing={12}
          maxW="7xl"
          mx="auto"
          zIndex={1}
          position="relative"
        >
          {/* Headline & CTA */}
          <VStack align="start" spacing={6} color="white" maxW="lg">
            <Heading as="h1" fontSize={{ base: "4xl", md: "6xl" }} lineHeight="1.1">
              Own Your Health Data.
            </Heading>
            <Text fontSize={{ base: "md", md: "xl" }}>
              Aptocare puts <strong>you</strong> in control of your medical records with a
              secure, blockchain‑powered vault.
            </Text>
            <HStack spacing={4}>
              <Button size="lg" colorScheme="whiteAlpha" onClick={handleCTA}>
                {connected ? "Enter App" : "Connect Wallet"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                color="whiteAlpha.900"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={() => navigate("/learn")}
              >
                Learn More
              </Button>
            </HStack>
          </VStack>

          {/* Mockup Preview */}
        
          <Image
  src="/doctor.jpg"
  alt="Doctor with medical records"
  w="full"
  h="auto"
  style={{ borderRadius: '50%' }} // fully rounded
/>



        </SimpleGrid>
      </Box>

      {/* Enhanced Features Section */}
      <FeaturesSection />

      
      {/* Footer Section */}
      <Box 
        as="footer" 
        bg={useColorModeValue("gray.900", "gray.800")} 
        color="white"
        pt={16}
        pb={8}
        position="relative"
        overflow="hidden"
      >
        {/* Gradient background elements */}
        <Box
          position="absolute"
          top={0}
          left={0}
          w="full"
          h="full"
          bgGradient="linear(to-br, teal.900 0%, blue.900 50%, purple.900 100%)"
          opacity={0.6}
          zIndex={0}
        />
        <Box
          position="absolute"
          top="-50%"
          left="-50%"
          w="200%"
          h="200%"
          bgGradient="radial(teal.500 0%, transparent 70%)"
          opacity={0.1}
          zIndex={0}
        />
        
        <Container maxW="7xl" position="relative" zIndex={1}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            {/* Company Info */}
            <VStack align="start" spacing={6}>
              <Heading size="lg" color="white">
                Aptocare
              </Heading>
              <Text color="gray.400">
                Empowering patients through decentralized healthcare technology.
              </Text>
              <HStack spacing={4}>
                {['Twitter', 'Discord', 'Github'].map((social) => (
                  <Button 
                    key={social}
                    variant="ghost" 
                    color="gray.400"
                    _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
                    size="sm"
                    leftIcon={<Icon as={ViewIcon} />}
                  >
                    {social}
                  </Button>
                ))}
              </HStack>
            </VStack>

            {/* Quick Links */}
            <VStack align="start" spacing={4}>
              <Heading size="md">Quick Links</Heading>
              {['About', 'Features', 'Pricing', 'Contact'].map((link) => (
                <Button 
                  key={link}
                  variant="link" 
                  color="gray.400"
                  _hover={{ color: 'white' }}
                  onClick={() => navigate(`/${link.toLowerCase()}`)}
                >
                  {link}
                </Button>
              ))}
            </VStack>

            {/* Resources */}
            <VStack align="start" spacing={4}>
              <Heading size="md">Resources</Heading>
              {['Documentation', 'Blog', 'Whitepaper', 'Help Center'].map((resource) => (
                <Button 
                  key={resource}
                  variant="link" 
                  color="gray.400"
                  _hover={{ color: 'white' }}
                >
                  {resource}
                </Button>
              ))}
            </VStack>

            {/* Newsletter */}
            <VStack align="start" spacing={4}>
              <Heading size="md">Stay Updated</Heading>
              <Text color="gray.400">
                Subscribe to our newsletter for the latest updates.
              </Text>
              <HStack as="form" spacing={2} w="full">
                <Input 
                  placeholder="Your email" 
                  bg="whiteAlpha.100"
                  border="none"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                />
                <Button 
                  colorScheme="teal" 
                  type="submit"
                  px={6}
                >
                  Join
                </Button>
              </HStack>
            </VStack>
          </SimpleGrid>

          {/* Copyright */}
          <Box 
            borderTop="1px solid" 
            borderColor="whiteAlpha.200" 
            mt={12} 
            pt={8}
            textAlign="center"
          >
            <Text color="gray.500">
              © {new Date().getFullYear()} Aptocare. All rights reserved.
            </Text>
            <HStack justify="center" spacing={6} mt={4}>
              <Button variant="link" color="gray.500" size="sm">Terms</Button>
              <Button variant="link" color="gray.500" size="sm">Privacy</Button>
              <Button variant="link" color="gray.500" size="sm">Cookies</Button>
            </HStack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;