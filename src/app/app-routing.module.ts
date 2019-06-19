import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'tea-categories', pathMatch: 'full' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  {
    path: 'edit-tea-category',
    loadChildren: './edit-tea-category/edit-tea-category.module#EditTeaCategoryPageModule'
  },
  {
    path: 'tea-categories',
    loadChildren: './tea-categories/tea-categories.module#TeaCategoriesPageModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
