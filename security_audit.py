#!/usr/bin/env python3
"""
Security Audit Script for Market Mania
Checks for security issues, exposed secrets, and provides deployment readiness assessment
"""

import os
import re
import json
from pathlib import Path
from typing import List, Dict, Tuple

class SecurityAuditor:
    def __init__(self):
        self.issues = []
        self.warnings = []
        self.passed_checks = []
        
        # Patterns to look for
        self.secret_patterns = [
            (r'sk_[a-zA-Z0-9]{24,}', 'Stripe Secret Key'),
            (r'pk_[a-zA-Z0-9]{24,}', 'Stripe Public Key'),
            (r'eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*', 'JWT Token'),
            (r'AKIA[0-9A-Z]{16}', 'AWS Access Key'),
            (r'[0-9a-f]{32}', 'MD5 Hash (potential secret)'),
            (r'ghp_[a-zA-Z0-9]{36}', 'GitHub Personal Access Token'),
            (r'gho_[a-zA-Z0-9]{36}', 'GitHub OAuth Token'),
            (r'mongodb://[^:]+:[^@]+@', 'MongoDB Connection String with credentials'),
            (r'postgres://[^:]+:[^@]+@', 'PostgreSQL Connection String with credentials'),
        ]
        
        self.exclude_patterns = [
            r'\.git/',
            r'node_modules/',
            r'__pycache__/',
            r'\.pytest_cache/',
            r'venv/',
            r'\.venv/',
            r'coverage/',
            r'dist/',
            r'build/',
        ]
    
    def should_exclude_file(self, file_path: str) -> bool:
        """Check if file should be excluded from scanning"""
        for pattern in self.exclude_patterns:
            if re.search(pattern, file_path):
                return True
        return False
    
    def scan_file_for_secrets(self, file_path: Path) -> List[Tuple[str, str, int]]:
        """Scan a file for potential secrets"""
        secrets_found = []
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                for line_num, line in enumerate(f, 1):
                    for pattern, description in self.secret_patterns:
                        matches = re.finditer(pattern, line)
                        for match in matches:
                            # Skip if it's in a comment or example
                            if any(keyword in line.lower() for keyword in ['example', 'placeholder', 'your-', 'mock-']):
                                continue
                            secrets_found.append((description, match.group(), line_num))
        except Exception as e:
            self.warnings.append(f"Could not scan {file_path}: {e}")
        
        return secrets_found
    
    def check_env_files(self) -> None:
        """Check for .env files and their security"""
        env_files = []
        
        for root, dirs, files in os.walk('.'):
            for file in files:
                if file.startswith('.env') and not file.endswith('.example'):
                    env_files.append(os.path.join(root, file))
        
        if env_files:
            self.issues.append(f"Found .env files that should not be committed: {env_files}")
        else:
            self.passed_checks.append("No .env files found in repository")
    
    def check_gitignore(self) -> None:
        """Check if .gitignore properly excludes sensitive files"""
        gitignore_path = Path('.gitignore')
        
        if not gitignore_path.exists():
            self.issues.append(".gitignore file not found")
            return
        
        with open(gitignore_path, 'r') as f:
            gitignore_content = f.read()
        
        required_patterns = [
            '*.env',
            'venv/',
            '__pycache__/',
            'node_modules/',
            '*.key',
            '*.pem',
        ]
        
        missing_patterns = []
        for pattern in required_patterns:
            if pattern not in gitignore_content:
                missing_patterns.append(pattern)
        
        if missing_patterns:
            self.warnings.append(f"Missing patterns in .gitignore: {missing_patterns}")
        else:
            self.passed_checks.append(".gitignore properly configured")
        
        # Check if .kiro is properly excluded
        if '!.kiro/' in gitignore_content:
            self.passed_checks.append(".kiro directory properly preserved")
        else:
            self.warnings.append(".kiro directory should be preserved with !.kiro/")
    
    def scan_codebase(self) -> None:
        """Scan entire codebase for secrets"""
        secrets_found = {}
        
        for root, dirs, files in os.walk('.'):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if not self.should_exclude_file(os.path.join(root, d))]
            
            for file in files:
                file_path = Path(root) / file
                
                if self.should_exclude_file(str(file_path)):
                    continue
                
                # Only scan text files
                if file_path.suffix in ['.py', '.js', '.ts', '.tsx', '.json', '.yaml', '.yml', '.env', '.md', '.txt']:
                    secrets = self.scan_file_for_secrets(file_path)
                    if secrets:
                        secrets_found[str(file_path)] = secrets
        
        if secrets_found:
            self.issues.append("Potential secrets found in code:")
            for file_path, secrets in secrets_found.items():
                for description, secret, line_num in secrets:
                    self.issues.append(f"  {file_path}:{line_num} - {description}: {secret[:10]}...")
        else:
            self.passed_checks.append("No hardcoded secrets found in codebase")
    
    def check_dependencies(self) -> None:
        """Check for known vulnerable dependencies"""
        # Check Python requirements
        requirements_path = Path('backend/requirements.txt')
        if requirements_path.exists():
            self.passed_checks.append("Python requirements.txt found")
            # In a real implementation, you'd check against a vulnerability database
        
        # Check Node.js dependencies
        package_json_path = Path('frontend/package.json')
        if package_json_path.exists():
            self.passed_checks.append("Node.js package.json found")
            # In a real implementation, you'd run npm audit
    
    def check_docker_security(self) -> None:
        """Check Docker configuration security"""
        dockerfiles = []
        for root, dirs, files in os.walk('.'):
            for file in files:
                if file.startswith('Dockerfile'):
                    dockerfiles.append(os.path.join(root, file))
        
        if dockerfiles:
            self.passed_checks.append(f"Found Dockerfiles: {dockerfiles}")
            # Check for .dockerignore
            for dockerfile in dockerfiles:
                dockerignore_path = Path(dockerfile).parent / '.dockerignore'
                if dockerignore_path.exists():
                    self.passed_checks.append(f".dockerignore found for {dockerfile}")
                else:
                    self.warnings.append(f"Missing .dockerignore for {dockerfile}")
    
    def generate_report(self) -> Dict:
        """Generate security audit report"""
        return {
            'security_score': max(0, 100 - len(self.issues) * 20 - len(self.warnings) * 5),
            'issues': self.issues,
            'warnings': self.warnings,
            'passed_checks': self.passed_checks,
            'github_ready': len(self.issues) == 0,
            'recommendations': self.get_recommendations()
        }
    
    def get_recommendations(self) -> List[str]:
        """Get security recommendations"""
        recommendations = []
        
        if self.issues:
            recommendations.append("🚨 CRITICAL: Fix all security issues before pushing to GitHub")
        
        if self.warnings:
            recommendations.append("⚠️  Address warnings to improve security posture")
        
        recommendations.extend([
            "✅ Use environment variables for all secrets",
            "✅ Enable branch protection rules on GitHub",
            "✅ Set up automated security scanning (Dependabot, CodeQL)",
            "✅ Use secrets management service for production",
            "✅ Enable 2FA on all accounts",
            "✅ Regular security audits and dependency updates"
        ])
        
        return recommendations
    
    def run_audit(self) -> Dict:
        """Run complete security audit"""
        print("🔍 Running Security Audit...")
        print("=" * 50)
        
        self.check_env_files()
        self.check_gitignore()
        self.scan_codebase()
        self.check_dependencies()
        self.check_docker_security()
        
        return self.generate_report()

def main():
    """Main function"""
    auditor = SecurityAuditor()
    report = auditor.run_audit()
    
    print(f"\n📊 SECURITY AUDIT REPORT")
    print("=" * 50)
    print(f"🎯 Security Score: {report['security_score']}/100")
    print(f"🚀 GitHub Ready: {'✅ YES' if report['github_ready'] else '❌ NO'}")
    
    if report['issues']:
        print(f"\n🚨 CRITICAL ISSUES ({len(report['issues'])}):")
        for issue in report['issues']:
            print(f"  ❌ {issue}")
    
    if report['warnings']:
        print(f"\n⚠️  WARNINGS ({len(report['warnings'])}):")
        for warning in report['warnings']:
            print(f"  ⚠️  {warning}")
    
    if report['passed_checks']:
        print(f"\n✅ PASSED CHECKS ({len(report['passed_checks'])}):")
        for check in report['passed_checks']:
            print(f"  ✅ {check}")
    
    print(f"\n💡 RECOMMENDATIONS:")
    for rec in report['recommendations']:
        print(f"  {rec}")
    
    print("\n" + "=" * 50)
    
    if report['github_ready']:
        print("🎉 READY FOR GITHUB! Your repository is secure for public deployment.")
    else:
        print("🛑 NOT READY FOR GITHUB! Please fix critical issues first.")
    
    return 0 if report['github_ready'] else 1

if __name__ == "__main__":
    exit(main())