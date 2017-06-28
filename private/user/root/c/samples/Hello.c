/* Hello World program */
#include<stdio.h>
int main() {
    int *d;
    int a = 10;
    int b = 100;
    d = &a;
    printf("{ \"result\" : \">> Hello World %d\" }",*d+b);
}
