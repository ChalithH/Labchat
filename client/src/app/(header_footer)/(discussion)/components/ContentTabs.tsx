import { Dispatch, SetStateAction, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import MarkdownTips from "./MarkdownTips";
import remarkGfm from 'remark-gfm';

export default function ContentTabs({ setContents, contents }:{ setContents: Dispatch<SetStateAction<string>>, contents: string}) {
  const [tabValue, setTabValue] = useState("text");

  return (
    <div>
      <Tabs value={tabValue} onValueChange={setTabValue}>
        <TabsList>
          <TabsTrigger value="text">Contents</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <Textarea
            id="contents"
            className="text-sm"
            placeholder="Enter the contents of the post"
            value={contents}
            onChange={(e) => setContents(e.target.value)}
          />
        </TabsContent>

        <TabsContent value="preview">
          <div className="border rounded-sm mt-2 p-2 max-h-48 overflow-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{contents}</ReactMarkdown>
          </div>
        </TabsContent>

        <MarkdownTips />
      </Tabs>
    </div>
  );
}
