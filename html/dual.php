<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: text/plain');

$baseDir = realpath(__DIR__); 

function handleWinCommand($parts, $validatedDir, $baseDir) {
    $cmd = strtolower(array_shift($parts));
    $args = $parts;

    switch ($cmd) {
        case 'dir':
            $files = scandir($validatedDir);
            return implode("\n", $files);
        case 'pwd':
            return $validatedDir;
        case 'cd':
            $newDir = $args[0] ?? '';
            $targetPath = ($newDir === '' || $newDir === '~') 
                ? $baseDir 
                : realpath($validatedDir . DIRECTORY_SEPARATOR . $newDir);
            if ($targetPath && is_dir($targetPath) && strpos($targetPath, $baseDir) === 0) {
                return "set current directory " . $targetPath;
            }
            return "The system cannot find the path specified.";
        case 'copy':
            if (count($args) < 2) return "Syntax: copy <source> <destination>";
            $source = realpath($validatedDir . DIRECTORY_SEPARATOR . $args[0]);
            $dest = $validatedDir . DIRECTORY_SEPARATOR . $args[1];
            if ($source && file_exists($source) && strpos($source, $baseDir) === 0) {
                if (copy($source, $dest)) return "File copied successfully.";
            }
            return "Failed to copy file.";
        case 'move':
            if (count($args) < 2) return "Syntax: move <source> <destination>";
            $source = realpath($validatedDir . DIRECTORY_SEPARATOR . $args[0]);
            $dest = $validatedDir . DIRECTORY_SEPARATOR . $args[1];
            if ($source && file_exists($source) && strpos($source, $baseDir) === 0) {
                if (rename($source, $dest)) return "File moved successfully.";
            }
            return "Failed to move file.";
        case 'del':
        case 'erase':
            if (empty($args[0])) return "Syntax: del <file>";
            $target = realpath($validatedDir . DIRECTORY_SEPARATOR . $args[0]);
            if ($target && is_file($target) && strpos($target, $baseDir) === 0) {
                if (unlink($target)) return "File deleted successfully.";
            }
            return "Failed to delete file.";
        case 'ren':
        case 'rename':
            if (count($args) < 2) return "Syntax: ren <oldname> <newname>";
            $old = realpath($validatedDir . DIRECTORY_SEPARATOR . $args[0]);
            $new = $validatedDir . DIRECTORY_SEPARATOR . $args[1];
            if ($old && file_exists($old) && strpos($old, $baseDir) === 0) {
                if (rename($old, $new)) return "File renamed successfully.";
            }
            return "Failed to rename file.";
        case 'bash':
        case 'wsl':
            $wslCmd = implode(' ', $args);
            if ($wslCmd) {
                $output = shell_exec("wsl " . escapeshellcmd($wslCmd));
                return $output ?: "No output from WSL";
            }
            return "set shell mode bash";
        case 'repo':
            return "set shell mode repo";
        case 'cmd':
        case 'exit':
            return "set shell mode win";
        default:
            $output = shell_exec("cmd /c " . escapeshellcmd($cmd . ' ' . implode(' ', $args)));
            return $output ?: "Command executed (no output)";
    }
}

function handleBashCommand($parts, $validatedDir, $baseDir) {
    $cmd = strtolower(array_shift($parts));
    $args = $parts;

    switch ($cmd) {
        case 'ls':
            $files = scandir($validatedDir);
            return implode("\n", $files);
        case 'pwd':
            return $validatedDir;
        case 'cd':
            $newDir = $args[0] ?? '';
            $targetPath = ($newDir === '' || $newDir === '~') 
                ? $baseDir 
                : realpath($validatedDir . DIRECTORY_SEPARATOR . $newDir);
            if ($targetPath && is_dir($targetPath) && strpos($targetPath, $baseDir) === 0) {
                return "set current directory " . $targetPath;
            }
            return "bash: cd: " . $newDir . ": No such file or directory";
        case 'cp':
            if (count($args) < 2) return "Usage: cp <source> <destination>";
            $source = realpath($validatedDir . DIRECTORY_SEPARATOR . $args[0]);
            $dest = $validatedDir . DIRECTORY_SEPARATOR . $args[1];
            if ($source && file_exists($source) && strpos($source, $baseDir) === 0) {
                if (copy($source, $dest)) return "File copied successfully.";
            }
            return "Failed to copy file.";
        case 'mv':
            if (count($args) < 2) return "Usage: mv <source> <destination>";
            $source = realpath($validatedDir . DIRECTORY_SEPARATOR . $args[0]);
            $dest = $validatedDir . DIRECTORY_SEPARATOR . $args[1];
            if ($source && file_exists($source) && strpos($source, $baseDir) === 0) {
                if (rename($source, $dest)) return "File moved successfully.";
            }
            return "Failed to move file.";
        case 'rm':
            if (empty($args[0])) return "Usage: rm <file>";
            $target = realpath($validatedDir . DIRECTORY_SEPARATOR . $args[0]);
            if ($target && is_file($target) && strpos($target, $baseDir) === 0) {
                if (unlink($target)) return "File deleted successfully.";
            }
            return "Failed to delete file.";
        case 'repo':
            return "set shell mode repo";
        case 'cmd':
        case 'exit':
            return "set shell mode win";
        default:
            $output = shell_exec($cmd . ' ' . implode(' ', $args));
            return $output ?: "Command executed (no output)";
    }
}

function executeCommand($command, $currentDir, $baseDir, $shell) {
    $validatedDir = realpath($baseDir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $currentDir));
    if (!$validatedDir || strpos($validatedDir, $baseDir) !== 0) {
        $validatedDir = $baseDir;
    }
    
    $parts = str_getcsv($command, ' ', '"', '\\'); // ✅ Fixed deprecated call
    
    if ($shell === 'win') {
        return handleWinCommand($parts, $validatedDir, $baseDir);
    } else { 
        return handleBashCommand($parts, $validatedDir, $baseDir);
    }
}

$command = trim($_GET['command'] ?? '');
$currentDir = $_GET['cd'] ?? '';
$shell = $_GET['shell'] ?? 'win';

if (!empty($command)) {
    echo executeCommand($command, $currentDir, $baseDir, $shell);
}
?>
