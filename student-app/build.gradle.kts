// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.24" apply false
}

// Redirect build outputs outside of OneDrive to prevent Windows AccessDeniedException
val userHome = System.getProperty("user.home").replace('\\', '/')
val baseBuildDir = "$userHome/.android-builds/student-app"

layout.buildDirectory.set(file("$baseBuildDir/root"))

subprojects {
    layout.buildDirectory.set(file("$baseBuildDir/${project.name}"))
}
