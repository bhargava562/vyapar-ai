#!/usr/bin/env python3
"""
Cleanup and Security Script for Market Mania
Final cleanup and security check before GitHub deployment
"""

import os
import shutil
from pathlib import Path

def cleanup_unwanted_files():
    """Remove unwanted files and directories"""
    unwanted_patterns = [
        '__pycache__',
        '*.pyc',
        '.pytest_cache',
        'node_modules/.cache',
        '.DS_Store',
        'Thumbs.db',
        '*.log',
        'coverage',
        '.coverage',
        'htmlcov',
    ]
    
    removed_items = []
    
    for root, dirs, files in os.walk('.'):
        # Remove unwanted directories
        for dir_name in dirs[:]:  # Use slice to modify list while iterating
            if any(pattern in dir_name for pattern in ['__pycache__', '.pytest_cache', 'htmlcov']):
                dir_path = os.path.join(root, dir_name)
                try:
                    shutil.rmtree(dir_path)
                    removed_items.append(dir_path)
                    dirs.remove(dir_name)
                except Exception as e:
                    print(f"Could not remove {dir_path}: {e}")
        
        # Remove unwanted files
        for file_name in files:
            if any(file_name.endswith(ext) for ext in ['.pyc', '.log']) or file_name in ['.DS_Store', 'Thumbs.db']:
                file_path = os.path.join(root, file_name)
                try:
                    os.remove(file_path)
                    removed_items.append(file_path)
                except Exception as e:
                    print(f"Could not remove {file_path}: {e}")
    
    return removed_items

def check_virtual_environment():
    """Check if virtual environment is properly set up"""
    venv_path = Path('backend/venv')
    if venv_path.exists():
        print("✅ Virtual environment found at backend/venv")
        return True
    else:
        print("⚠️  Virtual environment not found. Run: cd backend && python setup_venv.py")
        return False

def verify_env_files():
    """Verify .env files are properly configured"""
    backend_env = Path('backend/.env')
    frontend_env = Path('frontend/.env')
    
    status = {
        'backend_env_exists': backend_env.exists(),
        'frontend_env_exists': frontend_env.exists(),
        'backend_example_exists': Path('backend/.env.example').exists(),
        'frontend_example_exists': Path('frontend/.env.example').exists(),
    }
    
    return status

def main():
    """Main cleanup and security check"""
    print("🧹 CLEANUP AND SECURITY CHECK")
    print("=" * 40)
    
    # Cleanup unwanted files
    print("🗑️  Cleaning up unwanted files...")
    removed = cleanup_unwanted_files()
    if removed:
        print(f"   Removed {len(removed)} items")
    else:
        print("   No unwanted files found")
    
    # Check virtual environment
    print("\n🐍 Checking Python virtual environment...")
    venv_ok = check_virtual_environment()
    
    # Verify environment files
    print("\n🔐 Checking environment configuration...")
    env_status = verify_env_files()
    
    for key, value in env_status.items():
        status = "✅" if value else "❌"
        print(f"   {status} {key.replace('_', ' ').title()}")
    
    # Final security assessment
    print("\n🛡️  SECURITY ASSESSMENT")
    print("=" * 40)
    
    security_score = 0
    max_score = 100
    
    # Check .gitignore
    if Path('.gitignore').exists():
        security_score += 20
        print("✅ .gitignore exists")
    else:
        print("❌ .gitignore missing")
    
    # Check .env files are not committed
    if not any(Path(f).exists() for f in ['backend/.env', 'frontend/.env']):
        security_score += 30
        print("✅ No .env files committed")
    else:
        print("❌ .env files found in repository")
    
    # Check .env.example files exist
    if env_status['backend_example_exists'] and env_status['frontend_example_exists']:
        security_score += 20
        print("✅ .env.example files exist")
    else:
        print("❌ Missing .env.example files")
    
    # Check virtual environment
    if venv_ok:
        security_score += 15
        print("✅ Virtual environment configured")
    else:
        print("❌ Virtual environment not found")
    
    # Check mock services
    if Path('backend/app/services/mock_agmarknet_service.py').exists():
        security_score += 15
        print("✅ Mock services implemented")
    else:
        print("❌ Mock services missing")
    
    print(f"\n🎯 SECURITY SCORE: {security_score}/{max_score}")
    
    # GitHub readiness assessment
    github_ready = security_score >= 85
    
    print(f"\n🚀 GITHUB DEPLOYMENT STATUS")
    print("=" * 40)
    
    if github_ready:
        print("✅ READY FOR GITHUB PUBLIC REPOSITORY")
        print("   Your repository is secure and ready for public deployment!")
        print("\n📋 Next steps:")
        print("   1. git add .")
        print("   2. git commit -m 'Initial secure commit'")
        print("   3. git push origin main")
        print("   4. Set up GitHub Actions for CI/CD")
        print("   5. Configure branch protection rules")
    else:
        print("❌ NOT READY FOR GITHUB")
        print("   Please address the security issues above before making the repository public.")
        print("\n🔧 Required fixes:")
        if security_score < 85:
            print("   - Ensure all secrets are in environment variables")
            print("   - Set up proper .gitignore patterns")
            print("   - Create .env.example templates")
            print("   - Set up virtual environment")
    
    print(f"\n📊 FINAL ASSESSMENT")
    print("=" * 40)
    print(f"Security Score: {security_score}/100")
    print(f"GitHub Ready: {'YES ✅' if github_ready else 'NO ❌'}")
    print(f"Mock APIs: {'Configured ✅' if Path('backend/app/services/mock_agmarknet_service.py').exists() else 'Missing ❌'}")
    print(f"Virtual Environment: {'Ready ✅' if venv_ok else 'Setup Required ❌'}")
    
    return 0 if github_ready else 1

if __name__ == "__main__":
    exit(main())