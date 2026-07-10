
import { Carousel_002 } from "./ui/skiper-ui/skiper48";

type NewsArticle = {
  source: string
  heading: string
  content: string
  image: string
  url: string
}

export const CustomCarousel = ({ articles }: { articles?: NewsArticle[] }) => {
  const images = articles
    ? articles.map((a) => ({
        src: a.image,
        alt: a.heading,
        heading: a.heading,
        content: a.content,
        source: a.source,
        url: a.url,
      }))
    : [
        {
          src: "https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Description 1",
        },
        {
          src: "https://images.unsplash.com/photo-1782825955433-cce9fe38a62d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0fHx8ZW58MHx8fHx8",
          alt: "Description 2",
        },
        {
          src: "https://images.unsplash.com/photo-1783313207203-3d039ba6d2a5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Description 3",
        },
        {
          src: "https://images.unsplash.com/photo-1783201034031-b365a9c9047e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyOHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Description 4",
        },
        {
          src: "https://images.unsplash.com/photo-1783003530096-c17dff6b63b1?q=80&w=685&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          alt: "Description 5",
        },
        {
            src:"https://images.unsplash.com/photo-1783159649878-f39b8e4f84bb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0M3x8fGVufDB8fHx8fA%3D%3D",
            alt:"Description 6"
        },
        {
            src:"https://images.unsplash.com/photo-1783339788750-2458ff308a31?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1M3x8fGVufDB8fHx8fA%3D%3D",
            alt:"Description 7"
        },
        {
            src:"https://plus.unsplash.com/premium_photo-1780314442741-4a4700317392?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw3Nnx8fGVufDB8fHx8fA%3D%3D",
            alt:"Description 8"
        },
        {
            src:"https://images.unsplash.com/photo-1782329566851-c0748a5577b6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2OHx8fGVufDB8fHx8fA%3D%3D",
            alt:"Description 9"
        },
      ]

  return (
    <Carousel_002
      images={images}
      loop={true}
      autoplay={true}
      spaceBetween={40}
    />
  )
}
