# Bulk Image Upload - Quick Start Guide

## 📝 Overview

This script allows you to bulk upload images for your menu items using a CSV mapping file.

## 🚀 Quick Start (3 Steps)

### Step 1: Import Menu Data (Without Images)

1. Go to Admin Panel → Menu Management
2. Click "Import CSV"
3. Upload your menu data CSV (without images)
4. Wait for import to complete

### Step 2: Prepare Images

1. Create a folder called `menu-images` in the project root
2. Place all your menu images in this folder
3. Name them clearly (e.g., `steamed-momo.jpg`, `fried-momo.jpg`)

### Step 3: Create Mapping CSV

Create `image-mapping.csv` with this format:

```csv
productName,imageFilename
Steamed Momo,steamed-momo.jpg
Fried Momo,fried-momo.jpg
Paneer Momo,paneer-momo.jpg
```

**IMPORTANT:**

- `productName` must EXACTLY match the name in your menu database
- `imageFilename` must match the actual file in `menu-images/` folder

### Step 4: Run the Script

```bash
# Install dependencies (first time only)
npm install axios form-data

# Run the upload script
node uploadMenuImages.js
```

## 📁 File Structure

```
momo_magic_Version_2/
├── uploadMenuImages.js          # ← The upload script
├── image-mapping.csv            # ← Your mapping file
├── menu-images/                 # ← Your images folder
│   ├── steamed-momo.jpg
│   ├── fried-momo.jpg
│   ├── paneer-momo.jpg
│   └── ...
├── backend/
└── frontend/
```

## 📋 CSV Format Details

### Header Row (Required)

```csv
productName,imageFilename
```

### Data Rows

Each row maps a menu item to an image file:

```csv
Steamed Momo,steamed-momo.jpg
```

- **productName**: Exact name as it appears in your menu database
- **imageFilename**: Name of the image file in `menu-images/` folder

### Example

```csv
productName,imageFilename
Steamed Momo,steamed-momo.jpg
Fried Momo,fried-momo.png
Chili Momo,chili-momo.webp
Paneer Burger,paneer-burger.jpg
Mango Shake,mango-shake.jpg
```

## ⚙️ Configuration

Edit `uploadMenuImages.js` to change settings:

```javascript
const CONFIG = {
  // Backend URL - change based on environment
  BACKEND_URL: 'http://localhost:5000',  // Local development
  // BACKEND_URL: 'https://your-backend.com',  // Production
  
  // File paths (relative to script location)
  CSV_FILE: './image-mapping.csv',
  IMAGES_FOLDER: './menu-images',
};
```

## 🔍 What the Script Does

1. ✅ Reads `image-mapping.csv`
2. ✅ For each row:
   - Finds the menu item in database by name
   - Uploads the image to your R2 storage
   - Updates the menu item with the new image URL
3. ✅ Shows progress for each item
4. ✅ Displays summary at the end
5. ✅ Saves detailed log to `upload-log-[timestamp].json`

## 📊 Example Output

```
╔══════════════════════════════════════════════════════════╗
║     Momo Magic - Bulk Image Upload Script               ║
╚══════════════════════════════════════════════════════════╝

📋 Configuration:
   Backend URL: http://localhost:5000
   CSV File: ./image-mapping.csv
   Images Folder: ./menu-images

📄 Reading CSV file: ./image-mapping.csv
✅ Found 10 mappings in CSV

🚀 Starting upload process for 10 items...

═══════════════════════════════════════════════════════════

🔄 Processing: Steamed Momo → steamed-momo.jpg
  🔍 Finding menu item: Steamed Momo
  ✅ Found: Steamed Momo (ID: 507f1f77bcf86cd799439011)
  ⬆️  Uploading image...
  ✅ Uploaded: https://r2.cloudflare.com/images/steamed-momo-abc123.jpg
  💾 Updating database...
  ✅ Updated successfully!

[... repeats for each item ...]

═══════════════════════════════════════════════════════════

📊 SUMMARY

✅ Successful: 9
❌ Failed: 1
📈 Total: 10

✅ Successfully uploaded:
   • Steamed Momo
   • Fried Momo
   • Paneer Momo
   [...]

❌ Failed uploads:
   • Unknown Item: Menu item not found in database

📝 Detailed log saved to: upload-log-1735456789123.json
```

## ❓ Troubleshooting

### ❌ "CSV file not found"

- Make sure `image-mapping.csv` exists in project root
- Or update `CSV_FILE` path in script

### ❌ "Images folder not found"

- Create `menu-images/` folder in project root
- Or update `IMAGES_FOLDER` path in script

### ❌ "Image not found: menu-images/xyz.jpg"

- Check image filename spelling
- Make sure file exists in `menu-images/` folder
- Check file extension (.jpg, .png, .webp)

### ❌ "Menu item not found: Item Name"

- Check product name spelling in CSV
- Must exactly match database entry (case-insensitive)
- Try partial names if exact doesn't work

### ❌ "Upload failed: Network Error"

- Make sure backend is running
- Check `BACKEND_URL` in script config
- Verify backend port (default: 5000)

### ❌ "Update failed: 404"

- Menu item exists but can't be updated
- Check if menu item ID is valid
- Verify update endpoint is working

## 🎯 Tips for Success

1. **Test with 1-2 items first** - Don't upload all images at once
2. **Use consistent naming** - Makes debugging easier
3. **Keep images optimized** - Compress before uploading
4. **Check spellings** - Product names must match exactly
5. **Save your CSV** - You might need to re-run

## 🔧 Advanced Usage

### Custom Backend URL

For production or custom ports:

```javascript
BACKEND_URL: 'https://api.momomagic.com'
```

### Different File Paths

```javascript
CSV_FILE: './data/my-mappings.csv',
IMAGES_FOLDER: './assets/menu-photos',
```

### Rerun Failed Uploads

1. Check `upload-log-[timestamp].json`
2. Create new CSV with only failed items
3. Run script again

## 📞 Need Help?

If you encounter issues:

1. Check the detailed log file
2. Verify backend is running
3. Test with 1 item first
4. Check console for error messages

---

**Happy Uploading! 🚀**
