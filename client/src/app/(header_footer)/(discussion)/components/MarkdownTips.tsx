import { useState } from "react"

const MarkdownTips = () => {
  const [showTips, setShowTips] = useState(false)

  return (
    <div className="mb-8">
      <button
        onClick={() => setShowTips(!showTips)}
        className="text-xs play-font text-blue-600 underline"
        type="button">
            {showTips ? "Hide" : "Show"} Markdown Tips
      </button>

      {showTips && 
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Bold:</strong> <code>**bold**</code></li>
            <li><em>Italic:</em> <code>*italic*</code></li>
            <li>Links: <code>[example](https://example.com)</code></li>
            <li>Headers: <code># H1, ## H2, ### H3</code></li>
            <li>Lists: <code>- item</code> or <code>1. item</code></li>
            <li>Code: <code>`inline code`</code> or blocks with triple backticks</li>
          </ul>
        </div>
      }
    </div>
  );
}

export default MarkdownTips
