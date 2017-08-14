#include<stdio.h>
#include<stdlib.h>
#include <time.h>

//#include <windows.h>


//18.446.744.073.709.551.615
//18.446.744.073.709.551.615
typedef unsigned long long int i64;

//BOOL WINAPI QueryPerformanceCounter( _Out_ LARGE_INTEGER *lpPerformanceCount );

int main() {
    i64 i = 0xFFFFFFFFFFFFFFFF;
    int r;
    
    printf("hello\n%llu\n%d",i,r);
    return 0;
}