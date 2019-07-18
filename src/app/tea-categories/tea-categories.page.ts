import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { AuthenticationService } from '../services/authentication/authentication.service';
import { TeaCategory } from '../models/tea-category';
import { TeaCategoriesService } from '../services/tea-categories/tea-categories.service';

@Component({
  selector: 'app-tea-categories',
  templateUrl: 'tea-categories.page.html',
  styleUrls: ['tea-categories.page.scss']
})
export class TeaCategoriesPage implements OnInit {
  categories$: Observable<Array<TeaCategory>>;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private teaCategories: TeaCategoriesService
  ) {}

  ngOnInit() {
    this.categories$ = this.teaCategories.changed.pipe(flatMap(() => this.teaCategories.getAll()));
    setTimeout(() => this.teaCategories.changed.next());
  }

  logout() {
    this.authentication.logout().subscribe(() => this.navController.navigateRoot('/login'));
  }

  editCategory(id: number) {
    this.navController.navigateForward(['edit-tea-category', id]);
  }
}
