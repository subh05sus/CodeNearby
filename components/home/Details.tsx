import { Badge } from "../ui/badge";

function Details() {
  return (
    <div>
      <div className="flex gap-4 flex-col items-start">
        <div>
          <Badge>Platform</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-2 flex-col">
            <h2 className="text-xl md:text-3xl lg:text-5xl tracking-tighter lg:max-w-xl font-regular text-left">
              This is the start of something new
            </h2>
            <p className="text-lg max-w-xl lg:max-w-full leading-relaxed tracking-tight text-muted-foreground text-left">
              Finding the right developer to work with should be easy. Whether
              you want a coding partner, to share ideas, or join a project,
              Codenearby makes it simple. Our goal is to make developer
              connections quick and easy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Details;
