import os
import shutil

def cleanup_extra_db():
    # List of possible database locations
    possible_paths = [
        os.path.abspath('instance/ace.db'),
        os.path.abspath('backend/instance/ace.db'),
    ]
    
    # Find all existing database files
    existing_dbs = [p for p in possible_paths if os.path.exists(p)]
    
    if not existing_dbs:
        print("✅ No database files found to clean up.")
        return
        
    print("Found database files at:")
    for i, path in enumerate(existing_dbs, 1):
        print(f"{i}. {path}")
    
    if len(existing_dbs) > 1:
        # Keep the first one, remove others
        db_to_keep = existing_dbs[0]
        print(f"\n🔧 Keeping database at: {db_to_keep}")
        
        for path in existing_dbs[1:]:
            try:
                os.remove(path)
                print(f"🗑️  Removed: {path}")
            except Exception as e:
                print(f"❌ Error removing {path}: {e}")
    else:
        print("\n✅ Only one database found, no cleanup needed.")
    
    print("\nRestart your application to use the remaining database.")

if __name__ == "__main__":
    cleanup_extra_db()
