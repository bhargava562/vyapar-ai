#!/usr/bin/env python3
"""
Virtual Environment Setup Script for Market Mania Backend
Creates and configures a Python virtual environment with all dependencies
"""

import os
import sys
import subprocess
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return None

def main():
    """Main setup function"""
    print("🚀 Setting up Market Mania Backend Virtual Environment")
    print("=" * 60)
    
    # Check Python version
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("❌ Python 3.8+ is required")
        sys.exit(1)
    
    print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro} detected")
    
    # Create virtual environment
    venv_path = "venv"
    if os.path.exists(venv_path):
        print(f"📁 Virtual environment already exists at {venv_path}")
    else:
        if not run_command(f"python -m venv {venv_path}", "Creating virtual environment"):
            sys.exit(1)
    
    # Determine activation script based on OS
    if platform.system() == "Windows":
        activate_script = os.path.join(venv_path, "Scripts", "activate")
        pip_path = os.path.join(venv_path, "Scripts", "pip")
    else:
        activate_script = os.path.join(venv_path, "bin", "activate")
        pip_path = os.path.join(venv_path, "bin", "pip")
    
    # Upgrade pip
    if not run_command(f"{pip_path} install --upgrade pip", "Upgrading pip"):
        sys.exit(1)
    
    # Install requirements
    if os.path.exists("requirements.txt"):
        if not run_command(f"{pip_path} install -r requirements.txt", "Installing requirements"):
            sys.exit(1)
    else:
        print("⚠️  requirements.txt not found, skipping package installation")
    
    # Install development dependencies
    dev_packages = [
        "black",  # Code formatting
        "flake8",  # Linting
        "mypy",   # Type checking
        "pytest-watch",  # Test watching
        "ipython",  # Better REPL
    ]
    
    dev_command = f"{pip_path} install " + " ".join(dev_packages)
    run_command(dev_command, "Installing development packages")
    
    print("\n🎉 Virtual environment setup completed!")
    print("=" * 60)
    print("📋 Next steps:")
    
    if platform.system() == "Windows":
        print(f"   1. Activate: {venv_path}\\Scripts\\activate")
    else:
        print(f"   1. Activate: source {venv_path}/bin/activate")
    
    print("   2. Run: python app/main.py")
    print("   3. API docs: http://localhost:8000/docs")
    print("\n💡 Tips:")
    print("   - Use 'deactivate' to exit the virtual environment")
    print("   - Add 'venv/' to .gitignore (already done)")
    print("   - Use 'pip freeze > requirements.txt' to update dependencies")

if __name__ == "__main__":
    main()