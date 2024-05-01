"use client"
import { ChevronDown, ChevronUp, Loader2, RotateCw, Search } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf"
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css'
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector"
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import SimpleBar from "simplebar-react"
import PdfFullScreen from "./PdfFullScreen";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface PdfRendererProps {
  url: string
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast()


  const [numPages, setNumPages] = useState<number>()
  const [currentPage, setCurrPage] = useState<number>(1)
  const [scale, setScale] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0)
  const [renderedScale, setRenderedScale] = useState<number | null>(null)

  const isLoading = renderedScale !== scale // prevent some flikker when we zoom in and there is white space between the render time when we go to 100 to 150 or whatever

  const { width, ref } = useResizeDetector()

  const CustomPageValidator = z.object({
    page: z.string().refine((num) => Number(num) > 0 && Number(num) <= numPages!)
  })

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>


  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1"
    },
    resolver: zodResolver(CustomPageValidator)
  })


  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    console.log(page)
    setCurrPage(Number(page))
    setValue('page', String(page))
  }

  return (
    <div className=' w-full bg-white rounded-md shadow flex flex-col items-center'>
      {/* for top bar */}

      <div className=" h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            disabled={currentPage <= 1}
            onClick={() => {
              setCurrPage((prev: any) => prev - 1 > 1 ? prev - 1 : 1)
              setValue('page', String(currentPage - 1))
            }}
            variant={'ghost'}
            aria-label="previous page">
            <ChevronDown />
          </Button>

          <div className=" flex items-center gap-1.5">
            <Input
              {...register("page")}
              className={cn(
                'w-12 h-8',
                errors.page && 'focus-visible:ring-red-500'
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)()
                }
              }}
            />
            <p className=" text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? 'x'}</span>
            </p>
          </div>

          <Button
            disabled={
              numPages === undefined ||
              currentPage === numPages
            }
            onClick={() => {
              setCurrPage((prev) => prev + 1 > numPages! ? numPages! : prev + 1)
              setValue('page', String(currentPage + 1))
            }} 
            variant={'ghost'}
            aria-label="next page">
            <ChevronUp />
          </Button>
        </div>

        <div className=" space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="zoom" variant={'ghost'} className=" gap-1.5" >
                <Search className=" h-4 w-4" />
                {scale * 100}% <ChevronDown className=" w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setRotation((prev) => prev + 90)}
            aria-label="rotate 90 degrees"
            variant={'ghost'}
          >
            <RotateCw className=" h-4 w-4" />
          </Button>

          <PdfFullScreen fileUrl={url} />
        </div>
      </div>

      {/* for pdf render */}
      <div className=" flex-1  w-full max-h-screen">
        {/* simple bar to prevent page not to falt and cause an error or it fix the the zoomed pdf in the fixed container and makes it look good */}
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]" >
          <div ref={ref}>
            <Document
              loading={
                <div className=" flex justify-center">
                  <Loader2 className=" my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Error loading pdf",
                  description: "Please try again later",
                  variant: "destructive"
                })
              }}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              file={url}
              className="max-h-full"
            >
             { //page when loading
              isLoading && renderedScale ?  <Page // when there is loading then we are gone show a default current page
              width={width ? width : 1}
              pageNumber={currentPage}
              key={"@" + renderedScale}
              scale={scale}
              rotate={rotation}
            /> : null
             }
             {/* final page after loading */}
             <Page
              className={cn(isLoading ? "hidden" : "")} 
              width={width ? width : 1}
              pageNumber={currentPage}
              scale={scale}
              rotate={rotation}
              key={"@" + scale}
              loading={
                <div className=" flex justify-center">
                  <Loader2 className=" my-24 h-6 w-6 animate-spin"/>
                </div>
              }

              onRenderSuccess={() => setRenderedScale(scale)} // here we identify when the scale is equal to the renderedScale and make the lading false
            />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  )
}

export default PdfRenderer
