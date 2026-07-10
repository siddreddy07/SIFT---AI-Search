import { summarizeMessages } from "./src/ai/summary.js"

const messages = [
  {
    "role": "user",
    "content": "Hello!"
  },
  {
    "role": "assistant",
    "content": "Hi! How can I help you today?"
  },
  {
    "role": "user",
    "content": "Can you explain what JSON is?"
  },
  {
    "role": "assistant",
    "content": "JSON (JavaScript Object Notation) is a lightweight format for storing and exchanging data."
  },
  {
    "role": "user",
    "content": "Why is it popular?"
  },
  {
    "role": "assistant",
    "content": "Because it is easy for humans to read and write and easy for machines to parse and generate."
  },
  {
    "role": "user",
    "content": "Can JSON store arrays?"
  },
  {
    "role": "assistant",
    "content": "Yes, JSON supports arrays, objects, strings, numbers, booleans, and null values."
  },
  {
    "role": "user",
    "content": "What is an object in JSON?"
  },
  {
    "role": "assistant",
    "content": "An object is a collection of key-value pairs enclosed in curly braces."
  },
  {
    "role": "user",
    "content": "Can you give me an example?"
  },
  {
    "role": "assistant",
    "content": "{\"name\":\"John\",\"age\":25}"
  },
  {
    "role": "user",
    "content": "Nice. What about arrays?"
  },
  {
    "role": "assistant",
    "content": "[\"apple\", \"banana\", \"orange\"]"
  },
  {
    "role": "user",
    "content": "Do APIs use JSON?"
  },
  {
    "role": "assistant",
    "content": "Yes, most modern REST APIs use JSON for request and response payloads."
  },
  {
    "role": "user",
    "content": "What is a REST API?"
  },
  {
    "role": "assistant",
    "content": "A REST API is an architectural style for building web services using HTTP methods like GET, POST, PUT, and DELETE."
  },
  {
    "role": "user",
    "content": "What does GET do?"
  },
  {
    "role": "assistant",
    "content": "GET is used to retrieve data from a server."
  },
  {
    "role": "user",
    "content": "And POST?"
  },
  {
    "role": "assistant",
    "content": "POST is used to create new resources on a server."
  },
  {
    "role": "user",
    "content": "Can JSON contain nested objects?"
  },
  {
    "role": "assistant",
    "content": "Yes, JSON objects can contain other objects and arrays."
  },
  {
    "role": "user",
    "content": "What databases do you know?"
  },
  {
    "role": "assistant",
    "content": "Popular databases include PostgreSQL, MySQL, MongoDB, Redis, and SQLite."
  },
  {
    "role": "user",
    "content": "Which one is relational?"
  },
  {
    "role": "assistant",
    "content": "PostgreSQL and MySQL are relational databases."
  },
  {
    "role": "user",
    "content": "What is MongoDB?"
  },
  {
    "role": "assistant",
    "content": "MongoDB is a NoSQL document database that stores data in BSON documents."
  },
  {
    "role": "user",
    "content": "What is Redis?"
  },
  {
    "role": "assistant",
    "content": "Redis is an in-memory data store commonly used for caching, sessions, and message queues."
  },
  {
    "role": "user",
    "content": "What programming languages are popular?"
  },
  {
    "role": "assistant",
    "content": "JavaScript, Python, Java, TypeScript, Go, Rust, and C# are widely used."
  },
  {
    "role": "user",
    "content": "I like JavaScript."
  },
  {
    "role": "assistant",
    "content": "JavaScript is a versatile language used for frontend, backend, and full-stack development."
  },
  {
    "role": "user",
    "content": "What is Node.js?"
  },
  {
    "role": "assistant",
    "content": "Node.js is a JavaScript runtime that allows JavaScript to run outside the browser."
  },
  {
    "role": "user",
    "content": "Can Node.js connect to databases?"
  },
  {
    "role": "assistant",
    "content": "Yes, Node.js can connect to databases such as PostgreSQL, MongoDB, MySQL, and Redis."
  }
]
async function main() {
   const result = await summarizeMessages(messages)

   console.log('Summarizer :',result)

  }

await main()
