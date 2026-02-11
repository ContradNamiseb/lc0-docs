
import os
import re

PAGES_DIR = "/home/contrad-namiseb/Desktop/lc0-docs/pages"

def fix_links(file_path):
    with open(file_path, "r") as f:
        content = f.read()

    # Fix CSS links
    content = content.replace('href="tabs.css"', 'href="../css/tabs.css"')
    content = content.replace('href="navtree.css"', 'href="../css/navtree.css"')
    content = content.replace('href="doxygen.css"', 'href="../css/doxygen.css"')
    
    # Fix JS links
    content = content.replace('src="jquery.js"', 'src="../js/jquery.js"')
    content = content.replace('src="dynsections.js"', 'src="../js/dynsections.js"')
    content = content.replace('src="resize.js"', 'src="../js/resize.js"')
    content = content.replace('src="navtreedata.js"', 'src="../js/navtreedata.js"')
    content = content.replace('src="navtree.js"', 'src="../js/navtree.js"')
    content = content.replace('src="menudata.js"', 'src="../js/menudata.js"')
    content = content.replace('src="menu.js"', 'src="../js/menu.js"')
    
    # Fix Search links
    content = content.replace('href="search/search.css"', 'href="../search/search.css"')
    content = content.replace('src="search/searchdata.js"', 'src="../search/searchdata.js"')
    content = content.replace('src="search/search.js"', 'src="../search/search.js"')
    
    # Fix SearchBox initialization
    content = content.replace('SearchBox("searchBox", "search/",', 'SearchBox("searchBox", "../search/",')

    # Fix Init Calls
    content = re.sub(r"initNavTree\('([^']+)',\s*''\)", r"initNavTree('\1','../')", content)
    
    # Fix Init Menu
    if "initMenu('../'," not in content:
        content = content.replace("initMenu('',", "initMenu('../',")

    # Fix Image Sources (Footer logo, etc)
    content = content.replace('src="doxygen.svg"', 'src="../doxygen.svg"')
    content = content.replace('src="doxygen.png"', 'src="../doxygen.png"')
    
    # Fix closed/open pngs if in HTML (dynsections fallback or initial state)
    # Assumes they are in css/ because dynsections.js logic (if modified or works with local path)
    # But dynsections.js replaces part of src. 
    # If src is "closed.png", we change it to "../css/closed.png".
    content = content.replace('src="closed.png"', 'src="../css/closed.png"')
    content = content.replace('src="open.png"', 'src="../css/open.png"')

    with open(file_path, "w") as f:
        f.write(content)

def main():
    count = 0
    if not os.path.exists(PAGES_DIR):
        print(f"Error: {PAGES_DIR} does not exist.")
        return

    for root, dirs, files in os.walk(PAGES_DIR):
        for file in files:
            if file.endswith(".html"):
                fix_links(os.path.join(root, file))
                count += 1
    print(f"Fixed links in {count} files.")

if __name__ == "__main__":
    main()
