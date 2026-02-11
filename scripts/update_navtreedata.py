
import os
import re

NAV_FILE = "/home/contrad-namiseb/Desktop/lc0-docs/js/navtreedata.js"

def update_navtreedata():
    if not os.path.exists(NAV_FILE):
        print(f"Error: {NAV_FILE} not found.")
        return

    with open(NAV_FILE, "r") as f:
        content = f.read()

    # 1. Prepend 'pages/' to all .html links EXCEPT index.html
    
    # Regex explanation:
    # "([^"]+\.html)(#[^"]*)?" matches:
    # Group 1: filename.html
    # Group 2: optional anchor (#...)
    # Inside a double quoted string.
    
    def replace_link(match):
        full_match = match.group(0) # The whole string including quotes
        link = match.group(1) # filename.html
        anchor = match.group(2) or "" # anchor or empty
        
        if link == "index.html":
            return full_match
        if link.startswith("pages/"):
            return full_match
        if link.startswith("http") or link.startswith("www"):
            return full_match
            
        return f'"pages/{link}{anchor}"'

    # Match "filename.html" or "filename.html#anchor"
    content = re.sub(r'"([^"]+\.html)(#[^"]*)?"', replace_link, content)
    
    # 2. Add "Search Topology" section if missing
    search_topology_entry = '    [ "Search Topology", "pages/namespacelczero_1_1classic.html", [\n      [ "Classic", "pages/namespacelczero_1_1classic.html", null ],\n      [ "DAG Classic", "pages/namespacelczero_1_1dag__classic.html", null ]\n    ] ],'
    
    if "Search Topology" not in content:
        # Check if we can find the Todo List entry (which might have been prefixed now)
        # It could be "pages/todo.html" or "todo.html" depending on if script ran before.
        # We just look for the line structure.
        
        # Try finding the line with "Todo List"
        # [ "Todo List", "pages/todo.html", null ],
        todo_pattern = r'\[ "Todo List", "[^"]*", null \],'
        match = re.search(todo_pattern, content)
        if match:
            # Insert after the matched line
            content = content[:match.end()] + "\n" + search_topology_entry + content[match.end():]
        else:
            print("Warning: Could not find Todo List entry to insert Search Topology after.")

    with open(NAV_FILE, "w") as f:
        f.write(content)
    print("Updated js/navtreedata.js with anchor support")

if __name__ == "__main__":
    update_navtreedata()
