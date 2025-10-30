import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const items = [
  {
    title: "Slide 1",
    description: "This is the first slide of the carousel.",
  },
  {
    title: "Slide 2",
    description: "Here's the second one, nice and clean.",
  },
  {
    title: "Slide 3",
    description: "uooooooooooooooooooun",
  },
  {
    title: "Slide 4",
    description: "Last slide - ready to impress!",
  },
]

export default function CarouselExample() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-6 py-10 px-4 bg-pink-100">
      <Carousel className="relative">
        <CarouselContent className="-ml-4">
          {items.map((item, index) => (
            <CarouselItem
              key={index}
              className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 snap-center"
            >
              <div className="bg-white p-6 rounded-xl shadow-md h-full flex flex-col justify-center">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-white/80 hover:bg-white text-black dark:bg-zinc-800 dark:text-white shadow" />
        <CarouselNext className="right-2 bg-white/80 hover:bg-white text-black dark:bg-zinc-800 dark:text-white shadow" />
      </Carousel>
    </div>
  )
}
