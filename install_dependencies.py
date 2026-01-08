#!/usr/bin/env python3
"""
Quick dependency installer for ACE Learning Platform
Run this to install all required packages
"""

import subprocess
import sys

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
        return True
    except subprocess.CalledProcessError:
        return False

def main():
    print("=" * 60)
    print("🎓 ACE Learning Platform - Dependency Installer")
    print("=" * 60)
    print()
    
    packages = [
        'flask==2.3.3',
        'flask-cors==4.0.0',
        'flask-socketio==5.3.6',
        'flask-sqlalchemy==3.0.5',
        'werkzeug==2.3.7',
        'python-socketio==5.8.0',
        'python-engineio==4.7.1',
        'marshmallow==3.20.1'
    ]
    
    print(f"📦 Installing {len(packages)} packages...\n")
    
    failed_packages = []
    
    for i, package in enumerate(packages, 1):
        package_name = package.split('==')[0]
        print(f"[{i}/{len(packages)}] Installing {package_name}...", end=' ')
        
        if install_package(package):
            print("✅ Done")
        else:
            print("❌ Failed")
            failed_packages.append(package)
    
    print()
    print("=" * 60)
    
    if failed_packages:
        print("⚠️  Some packages failed to install:")
        for pkg in failed_packages:
            print(f"   - {pkg}")
        print("\n💡 Try installing manually:")
        print(f"   python -m pip install {' '.join(failed_packages)}")
        return False
    else:
        print("✅ All dependencies installed successfully!")
        print()
        print("🚀 Next steps:")
        print("   1. Run: python start_backend.py")
        print("   2. Open: index.html in your browser")
        print("   3. Enjoy learning!")
        return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
