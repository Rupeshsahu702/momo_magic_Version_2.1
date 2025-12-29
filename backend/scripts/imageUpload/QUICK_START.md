# 🚀 BULK IMAGE UPLOAD - QUICK REFERENCE

## Step-by-Step Process

### 1️⃣ Import Menu Data First

```bash
Admin Panel → Menu Management → Import CSV (menu without images)
```

### 2️⃣ Prepare Your Files

```
momo_magic_Version_2/
├── uploadMenuImages.js       ← Script (already created)
├── image-mapping.csv         ← Create this
└── menu-images/              ← Create this folder
    ├── steamed-momo.jpg      ← Add your images here
    ├── fried-momo.jpg
    └── ...
```

### 3️⃣ Create image-mapping.csv

```csv
productName,imageFilename
Steamed Momo,steamed-momo.jpg
Fried Momo,fried-momo.jpg
Paneer Momo,paneer-momo.jpg
```

### 4️⃣ Run Script

```bash
# Install dependencies (first time only)
npm install axios form-data

# Run the script
node uploadMenuImages.js
```

## ⚙️ Configuration (if needed)

Edit `uploadMenuImages.js` line 29-40:

```javascript
const CONFIG = {
  BACKEND_URL: 'http://localhost:5000',  // Change if different
  CSV_FILE: './image-mapping.csv',
  IMAGES_FOLDER: './menu-images',
};
```

## 📋 CSV Rules

✅ **DO:**

- Use exact product names from database
- Check image filenames match actual files
- Use common formats (.jpg, .png, .webp)

❌ **DON'T:**

- Add extra spaces
- Use quotes around names
- Leave blank rows

## 🐛 Common Issues

| Error | Solution |
|-------|----------|
| CSV not found | Check file name: `image-mapping.csv` |
| Image not found | Verify file is in `menu-images/` |
| Menu item not found | Check product name spelling |
| Backend error | Make sure backend is running (port 5000) |

## 📊 What Success Looks Like

```
✅ Successful: 10
❌ Failed: 0
📈 Total: 10

✅ Successfully uploaded:
   • Steamed Momo
   • Fried Momo
   • Paneer Momo
   ...
```

## 🔄 Workflow Summary

```
1. Import CSV (menu data, no images) → Database
2. Place images in menu-images/ folder
3. Create image-mapping.csv
4. Run: node uploadMenuImages.js
5. Check summary for success/failures
6. View uploaded images on website
```

---

**Need detailed help?** See `IMAGE_UPLOAD_GUIDE.md`
