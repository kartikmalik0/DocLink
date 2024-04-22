"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"

const UploadButton = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    return (
        <div>
            <Dialog
                open={isOpen}
                onOpenChange={(v) => {
                    if (!v) {
                        setIsOpen(v)
                    }
                }}
            >
                <DialogTrigger asChild onClick={()=>setIsOpen(true)}>
                    <Button>Upload PDF</Button>
                </DialogTrigger>

                <DialogContent>
                    Example content
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default UploadButton
