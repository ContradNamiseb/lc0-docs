
import os
import shutil
import glob

SOURCE_DIR = "/home/contrad-namiseb/Desktop/lc0-docs/lc0-src/docs_output/html"
DEST_DIR = "/home/contrad-namiseb/Desktop/lc0-docs"

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def copy_file(filename, src_subdir, dest_subdir):
    src = os.path.join(SOURCE_DIR, src_subdir, filename) if src_subdir else os.path.join(SOURCE_DIR, filename)
    dest_dir = os.path.join(DEST_DIR, dest_subdir) if dest_subdir else DEST_DIR
    dest = os.path.join(dest_dir, filename)
    
    ensure_dir(dest_dir)
    
    if os.path.exists(src):
        shutil.copy2(src, dest)
        # print(f"Copied {filename} to {dest_dir}")
    else:
        print(f"Warning: {filename} not found in {src}")

def main():
    print("Starting asset copy...")
    # Create directories
    ensure_dir(os.path.join(DEST_DIR, "css"))
    ensure_dir(os.path.join(DEST_DIR, "js"))
    ensure_dir(os.path.join(DEST_DIR, "search"))
    ensure_dir(os.path.join(DEST_DIR, "pages"))
    
    # CSS Files
    css_files = ["doxygen.css", "tabs.css", "navtree.css"]
    for f in css_files:
        copy_file(f, "", "css")
        
    # CSS referenced images (mostly icons)
    css_images = [
        "tab_a.png", "tab_b.png", "tab_h.png", "tab_s.png", 
        "tab_ad.png", "tab_bd.png", "tab_hd.png", "tab_sd.png",
        "nav_f.png", "nav_g.png", "nav_h.png",
        "nav_fd.png", "nav_gd.png", "nav_hd.png",
        "bc_s.png", "bc_sd.png",
        "splitbar.png", "splitbard.png",
        "folderclosed.svg", "folderopen.svg", "doc.svg",
        "folderclosedd.svg", "folderopend.svg", "docd.svg",
        "mag.svg", "mag_sel.svg", "mag_d.svg", "mag_seld.svg",
        "minus.svg", "plus.svg", "minusd.svg", "plusd.svg",
        "closed.png", "open.png"
    ]
    
    for f in css_images:
        copy_file(f, "", "css")

    # JS Files (Static)
    js_files = [
        "jquery.js", "dynsections.js", "resize.js", 
        "navtreedata.js", "navtree.js", "menudata.js", "menu.js"
    ]
    for f in js_files:
        copy_file(f, "", "js")
        
    # JS Files (Dynamic / Root)
    for f in glob.glob(os.path.join(SOURCE_DIR, "navtreeindex*.js")):
        filename = os.path.basename(f)
        copy_file(filename, "", "")
        
    # Sync icons
    copy_file("sync_on.png", "", "")
    copy_file("sync_off.png", "", "")
    
    # Doxygen Logo (Footer)
    copy_file("doxygen.svg", "", "") 
    copy_file("doxygen.png", "", "") 
    
    # Search directory
    src_search = os.path.join(SOURCE_DIR, "search")
    dest_search = os.path.join(DEST_DIR, "search")
    if os.path.exists(src_search):
        if os.path.exists(dest_search):
            shutil.rmtree(dest_search)
        shutil.copytree(src_search, dest_search)
        print(f"Copied search directory to {dest_search}")
    
    # GRAPH IMAGES
    # Copy all *graph.png, *graph.map, *graph.md5 to pages/
    # Also other .png/svg that might be used in pages (like formulas?)
    # Broadly copy likely page assets.
    
    graph_extensions = ["*.png", "*.map", "*.svg", "*.js"]
    # We exclude standard assets we already moved to css/js to avoid dupes/confusion, 
    # but strictly speaking copying them to pages/ wouldn't hurt functionality if links were not broken.
    # But since we fixed links to point to ../css, we don't strictly need them in pages/ 
    # EXCEPT for the graphs which are linked relatively.
    
    count = 0
    for ext in graph_extensions:
        for f in glob.glob(os.path.join(SOURCE_DIR, ext)):
            filename = os.path.basename(f)
            # Filter out the standard css/js/images we already handled if possible, to keep pages clean
            # But the graph names are specific (class...png).
            known_standard = set(css_images + css_files + js_files + ["doxygen.svg", "doxygen.png", "sync_on.png", "sync_off.png"])
            if filename in known_standard:
                continue
                
            # If it's a navtreeindex, skip (already in root)
            if filename.startswith("navtreeindex"):
                continue
                
            # Copy to pages/
            copy_file(filename, "", "pages")
            count += 1
            
    print(f"Copied {count} graph/page assets to pages/")

if __name__ == "__main__":
    main()
